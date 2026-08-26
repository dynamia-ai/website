---
title: 'HAMi 2.10 解读（一）| 实测 KAI Scheduler + HAMi GPU 显存硬隔离：谁也别想多占 1 MiB'
linktitle: KAI + HAMi 显存硬隔离实测
date: '2026-08-25'
excerpt: >-
  GPU 共享最大的焦虑是“说好一家一半，凭什么你能超”。本文是 HAMi 2.10 解读系列第一篇：用一次可在 GKE
  上复现的实测回答，KAI Scheduler 把两个 Pod 调度到同一张 NVIDIA T4 之后，HAMi-core
  是否真能把每个 Pod 的显存死死限制在配额内？申请 3 GiB 成功，累计 5 GiB 直接 OOM。
author: 宋净超（Jimmy Song）
tags:
  - HAMi
  - KAI Scheduler
  - GPU 共享
  - GPU 虚拟化
  - HAMi-core
  - Kubernetes
category: Technical Deep Dive
language: zh
coverTitle: HAMi 2.10 解读（一）
---

> GPU 共享最大的焦虑是“说好一家一半，凭什么你能超”。本文是 HAMi 2.10 解读系列第一篇：用一次可在 GKE 上复现的实测回答，KAI Scheduler 把两个 Pod 调度到同一张 NVIDIA T4 之后，HAMi-core 是否真能把每个 Pod 的显存死死限制在配额内？申请 3 GiB 成功，累计 5 GiB 直接 OOM。

GPU 太贵，一个任务独占一张卡是奢侈的；共享是刚需，但共享最大的焦虑是：说好一家一半，凭什么你能超？

调度器把两个 Pod 放到同一张卡上，只是共享的第一步。真正让人放心睡觉的，是每个 Pod 的显存用量被强制限制在配额之内——越界的分配请求直接报错，而不是靠应用“自觉”。

HAMi v2.10 已于近期发布，**KAI Scheduler + HAMi-core 集成**正是本次发布的重磅特性之一。作为 HAMi 2.10 解读系列的第一篇，本文先用一节把背景讲清楚，然后用一次实测回答一个问题：

**KAI Scheduler 把两个 Pod 调度到同一张 GPU 之后，HAMi-core 是否真的能限制每个 Pod 的显存用量？**

先说结论：**能**。我们在 GKE 上让两个 Pod 共享同一张 NVIDIA T4，各自看到 4147 MiB 显存上限；单 Pod 申请 3 GiB 成功，累计申请 5 GiB 直接 `out of memory`。一个 Pod 占着 3 GiB 时，另一个 Pod 依然能申请到自己的 3 GiB——谁也抢不走谁的配额。

## 背景：GPU 共享为什么需要“硬隔离”

### KAI Scheduler：NVIDIA 的开源 AI 调度器

[KAI Scheduler](https://github.com/kai-scheduler/KAI-Scheduler) 是 NVIDIA 开源的 Kubernetes 原生 AI 工作负载调度器。它的前身是 Run:ai 的调度引擎——NVIDIA 于 2024 年底收购 Run:ai 后，在 2025 年 4 月以 Apache 2.0 协议开源，现已成为 CNCF Sandbox 项目。

Kubernetes 默认调度器是为无状态服务设计的，把 GPU 当 CPU 核一样调度：每个 Pod 独占整张 GPU，没有 gang scheduling，没有团队公平性，没有拓扑感知。KAI Scheduler 正是为 AI 场景而生：

- **PodGroup（Gang Scheduling）**：分布式训练的多个 Pod 必须同时启动，避免 7 张 GPU 被占着却谁都跑不起来的尴尬；
- **Queue（层级公平调度）**：按部门/团队分配 GPU 配额，支持借用和回收；
- **Fractional GPU（GPU 分片共享）**：多个工作负载共享同一张 GPU，按比例或显存大小分配；
- **Topology-Aware Placement**：感知 GPU 互联拓扑，把紧耦合任务放进同一节点或 NVLink 域；
- **Elastic Workloads**：任务在最小和最大 Pod 数之间弹性伸缩。

### “软共享”的最后一公里问题

KAI Scheduler 的 GPU 分片共享很强大，但有一个关键限制：它是**协作式**的。调度器确保所有请求的显存份额加起来不超过整卡总量，却**不物理阻止**某个工作负载超额使用——一个请求 2000 MiB 显存的容器，在容器里依然可以通过 `nvidia-smi` 和 CUDA API 看到并使用完整的 GPU 显存。

![软共享与硬隔离对比：软共享下 nvidia-smi 仍显示完整显存、可超额使用；硬隔离下只能看到分配的配额、无法超额](/images/blog/kai-scheduler-hami-gpu-memory-hard-isolation/soft-vs-hard-sharing.png)

这在开发测试环境通常可以接受，但在生产多租户场景就是致命短板：

- 无法防止工作负载超额使用显存，导致 OOM 或互相干扰；
- 多租户之间缺乏真正的资源隔离保障；
- 无法精确控制每个容器的 GPU 显存上限。

### HAMi 与 HAMi-core

HAMi 是 CNCF 沙箱项目，专注于异构 AI 算力虚拟化中间件，支持 NVIDIA GPU、华为昇腾 NPU、寒武纪 MLU、海光 DCU、摩尔线程、天数智芯、燧原、昆仑芯、MetaX、AMD、壁仞等多种加速卡，是云原生 GPU 虚拟化领域覆盖最广的开源方案。其核心组件 **HAMi-core**（`libvgpu.so`）通过 CUDA 拦截，在 CUDA API 层强制限制 GPU 显存与算力。

简单理解两者的分工：

- **KAI Scheduler** = 决定“谁在什么时候用哪张 GPU”（**调度层**）
- **HAMi-core** = 确保“分了多少就只能用多少”（**隔离层**）

两者结合，才能实现真正意义上的生产级 GPU 共享。

### 从提案到内置：历时一年多的开源协作

这次集成是开源社区协作的典范，历时超过一年，HAMi 团队与 NVIDIA KAI Scheduler 团队紧密配合：

| 时间 | 里程碑 |
| ---- | ------ |
| 2025 年 4 月 | HAMi 维护者 [@archlitchi](https://github.com/archlitchi) 提交 PR #60“Resource isolation design”，提出资源隔离设计；社区讨论敲定分工——KAI 负责环境变量注入，HAMi 负责资源隔离组件 |
| 2026 年 4 月 | [@FouoF](https://github.com/FouoF) 提交 PR #1504，实现 GPU_MEMORY_LIMIT binder 插件 |
| 2026 年 5 月 28 日 | PR #1504 合并进入 KAI Scheduler 主干 |
| 2026 年 6 月 9 日 | PR #60 通过全部评审并正式合并，用户文档与 e2e 测试就绪 |
| 2026 年 6 月 | HAMi-core 隔离能力随 KAI Scheduler **v0.16.4** 内置发布 |
| 2026 年 8 月 | **HAMi v2.10.0** 发布，KAI Resource Isolator 伴随项目首次亮相，整条链路打包为开箱即用的 Helm Chart |

NVIDIA 官方调度器选择采用 HAMi-core 而非自研，是对 HAMi 技术路线正确性的有力背书。而在此之前，HAMi-core 已与多个主流调度器完成集成：

![HAMi-core 与主流调度器的集成版图：Kubernetes 默认调度器、Volcano、KAI Scheduler、Kueue、Koordinator](/images/blog/kai-scheduler-hami-gpu-memory-hard-isolation/ecosystem.png)

## 隔离链路：三个组件，一条契约

整条链路只有三项职责：

- **KAI Scheduler**：决定 Pod 使用哪张 GPU，并把计算出的显存配额通过环境变量 `CUDA_DEVICE_MEMORY_LIMIT` 注入容器；
- **kai-resource-isolator**：通过 DaemonSet 把 `libvgpu.so` 分发到每个 GPU 节点；它的 webhook 为业务 Pod 挂载该库并配置 `ld.so.preload`；可选的 monitor 组件在 `:9394` 端口暴露 `hami_*` 实时指标；
- **HAMi-core（`libvgpu.so`）**：拦截 `cudaMalloc` 等 CUDA 调用，拒绝超出配额的显存分配。

![KAI Scheduler + HAMi-core 隔离链路：配额计算、环境变量注入、webhook 挂载、CUDA 拦截与指标暴露](/images/blog/kai-scheduler-hami-gpu-memory-hard-isolation/isolation-chain.png)

这条设计的精妙之处在于 `CUDA_DEVICE_MEMORY_LIMIT` 这个**契约**：KAI 不需要知道 CUDA 调用是如何被拦截的，HAMi-core 也不需要知道配额是怎么算出来的。两者完全解耦——KAI 保留自己的调度逻辑，它集成的是 HAMi-core 这个隔离组件，而不是用完整的 HAMi 平台替换自身调度器。

容器启动时，动态链接器会先于 CUDA 库加载 `libvgpu.so`。HAMi-core 读取注入的配额，跟踪容器的显存用量，并改写设备查询结果——`nvidia-smi` 等工具只能看到配额内的显存；新的分配请求一旦越界，立即返回错误。

**这是在 CUDA API 层强制执行，不是依赖应用自觉遵守一个数值。**

## 四步跑通集成

以下步骤适用于任何 NVIDIA GPU 已经就绪的 Kubernetes 集群（节点能上报 `nvidia.com/gpu`，普通整卡 Pod 能正常执行 `nvidia-smi`）。

### 第 1 步：安装 KAI Scheduler

启用 GPU 共享与 `hamicore` binder 插件：

```bash
helm install kai-scheduler \
  oci://ghcr.io/kai-scheduler/kai-scheduler/kai-scheduler \
  --namespace kai-scheduler --create-namespace \
  --version v0.17.0 \
  --set global.gpuSharing=true \
  --set binder.plugins.hamicore.enabled=true

kubectl -n kai-scheduler wait --for=condition=available \
  --timeout=180s deploy --all
```

正常情况下，KAI 的所有组件（admission、binder、operator、scheduler 等）进入 Running 状态，默认父子队列创建完成。

### 第 2 步：安装 kai-resource-isolator

安装 HAMi-core 库分发组件、注入 webhook 和可选的 monitor：

```bash
helm install kai-resource-isolator \
  oci://docker.io/projecthami/kai-resource-isolator \
  --namespace kai-resource-isolator --create-namespace \
  --version 1.1.0-chart \
  --set monitor.enabled=true
```

部署完成后，每个 GPU 节点上都会有一个就绪的 libsync Pod（负责分发 `libvgpu.so`）和一个 monitor Pod，webhook 也进入就绪状态。

### 第 3 步：提交一个共享 GPU 的 Pod

关键就两个动作：打上 `gpu-memory` 注解（整数 MiB，不带单位后缀），并指定 KAI 为调度器：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: kai-hami-check
  labels:
    kai.scheduler/queue: default-queue
  annotations:
    gpu-memory: "4096"   # 单位 MiB
spec:
  schedulerName: kai-scheduler
  containers:
    - name: cuda
      image: nvidia/cuda:12.4.1-base-ubuntu22.04
      command: ["sleep", "infinity"]
```

Pod 会被调度到某个 GPU 节点并进入 Running 状态。

### 第 4 步：验证调度层到运行时的交接

一条命令检查三件事：KAI 注入的配额、isolator 注入的 preload 文件、HAMi-core 向容器暴露的显存：

```bash
kubectl exec kai-hami-check -- sh -lc '
  printf "limit=%s\n" "$CUDA_DEVICE_MEMORY_LIMIT"
  cat /etc/ld.so.preload
  nvidia-smi --query-gpu=uuid,memory.total --format=csv,noheader
'
```

在一张 15360 MiB 的 T4 上申请 4096 MiB，实测输出：

```text
limit=4147m
/usr/local/vgpu/libvgpu.so
GPU-9acc8878-3967-5fb4-c534-43d6fd820fa6, 4147 MiB
```

这三行分别证明：KAI 给了配额、HAMi-core 被注入、容器看到的是隔离后的上限而非整卡显存。到这里，集成链路已经生效。

至于 4147 而不是整好的 4096，下文解释。

## GKE 实测：硬隔离到底硬不硬？

验证环境：GKE 1.35/COS/CDI 集群，三个 `n1-standard-2` 节点，每个节点一张 NVIDIA T4（15360 MiB）。KAI Scheduler v0.17.0 负责共享调度，kai-resource-isolator 1.1.0-chart 负责注入 HAMi-core。

| 检查项 | 实测结果 | 证明了什么 |
| ------ | -------- | ---------- |
| 节点与 GPU UUID | 两个 Pod 位于同一单卡节点，返回同一 `GPU-9acc8878-...` | 它们共享同一张物理 T4 |
| 可见显存 | 两个 Pod 均报告 4147 MiB，整卡为 15360 MiB | HAMi-core 只暴露 KAI 分给各 Pod 的配额 |
| CUDA 分配 | 申请 3 GiB 成功，累计 5 GiB 返回 `out of memory` | 上限是强制的，不只是显示值变了 |
| 并发隔离 | Pod A 持有 3 GiB 时，Pod B 仍能申请自己的 3 GiB | 一个 Pod 无法占用另一个 Pod 的配额 |
| Monitor 指标 | 同节点 `:9394/metrics` 返回两个 Pod 的 4.348 GB 上限与 3.328 GB 实时用量 | 能观测每个 Pod 的实时显存用量 |

超额分配时，HAMi-core 在容器里记录：

```text
Device 0 OOM 5475663872 / 4348444672
allocate another 2 GiB: out of memory
```

这行日志的含义很直白：容器试图累计持有约 5 GiB（5475663872 字节）显存，而它的上限是 4147 MiB（4348444672 字节），CUDA 分配直接失败。

这些结果连成了一条完整的证据链：**确实调度到了同一张卡 → 容器内只见自身配额 → CUDA 分配确实越不过上限 → 实时用量可观测。**

两个补充说明：

- monitor 每个节点部署一个，只读取本节点缓存。查询时请访问业务 Pod 所在节点的 monitor 实例，别被 Service 转发到其他节点。
- 如果你也想在 GKE 上复现，除了上面四步，还需要针对只读根文件系统、RuntimeClass、NVML 库路径、CDI 设备注入和 PriorityClass 做环境适配，完整操作与故障排查见文末“实验 12”教程。

## 为什么是 4147 MiB，而不是申请的 4096？

因为 KAI 内部会先把 MiB 请求换算成**两位小数的 GPU fraction**，再乘以整卡显存得出最终强制上限：在 15360 MiB 的 T4 上，4096 MiB ≈ 0.27 张卡，0.27 × 15360 ≈ 4147 MiB。

所以容器里看到的数字比申请值略高一点是正常现象，不是 bug——真正的执行上限以 `CUDA_DEVICE_MEMORY_LIMIT` 为准。

## 实话实说：这是 CUDA 层隔离，不是硬件隔离

必须把边界说清楚：

本文验证的是 **CUDA API 层的显存限制**，不是 MIG 那类硬件安全边界。本次 GKE 兼容路径还使用了特权业务容器，因此**不应作为不可信多租户的安全方案**。对于可信团队内部的 GPU 共享、开发测试环境、推理服务混部这类场景，这套组合已经足够硬；如果面对的是不受信任的租户，请评估 MIG 等硬件级方案。

## 总结

- **背景**：KAI Scheduler 的 GPU 分片共享原本是“协作式”的，能共享不能隔离；HAMi-core 在 CUDA API 层强制执行显存配额，补上了 GPU 共享的“最后一公里”；
- **集成**：历时一年多的开源协作，两项核心 PR 合并进 KAI Scheduler 主干，随 v0.16.4 内置发布；HAMi v2.10 的 KAI Resource Isolator 把整条链路打包为开箱即用的 Helm Chart；
- **实测**：两个 Pod 共享同一张 T4，各自只见 4147 MiB 上限，配额内分配成功、超额分配直接 OOM，互不侵占——显存硬隔离，实测有效。

GPU 共享的“最后一公里”，现在真的通了。

## 系列阅读

- 本系列下一篇：[《HAMi 2.10 解读（二）：一张昇腾卡切给两个 Pod——Volcano + HAMi-core vNPU 软切分实测》](/blog/volcano-ascend-vnpu-soft-slicing/)
- 本系列第三篇：[《HAMi 2.10 解读（三）：既要独占、又要装箱、还要 NUMA 亲和——调度策略可以组合了》](/blog/hami-composable-scheduler-policies/)
- [《HAMi 2.10 发布解读：Flexible MIG、AMD vGPU 与调度生态全面升级》](/blog/hami-v210-deep-dive/)
- 上篇：[《「Dynamia 密瓜智能」主导 HAMi-core 接入 KAI Scheduler，补齐 GPU 共享生产级硬隔离》](/blog/hami-core-adopted-by-kai-scheduler/)
- 复现实测：[《实验 12：在 GKE 上验证 KAI Scheduler 与 HAMi 显存隔离》](https://project-hami.io/zh/tutorials/labs/kai-scheduler-hami-gke)

## 参考资料

- HAMi v2.10.0 发布公告：<https://project-hami.io/zh/blog/hami-v2-10-0-release>
- 用户文档《如何在 KAI Scheduler 中使用 HAMi》：<https://project-hami.io/zh/docs/next/userguide/kai-scheduler/how-to-use-kai-scheduler>
- 相关仓库：
  - HAMi：<https://github.com/Project-HAMi/HAMi>
  - HAMi-core：<https://github.com/Project-HAMi/HAMi-core>
  - KAI-resource-isolator：<https://github.com/Project-HAMi/KAI-resource-isolator>
  - KAI Scheduler：<https://github.com/kai-scheduler/KAI-Scheduler>

作者：宋净超（Jimmy Song），来自密瓜智能。

[![HAMi Community Meetup 上海站，2026 年 9 月 6 日](/images/blog/kai-scheduler-hami-gpu-memory-hard-isolation/meetup-shanghai-banner.webp)](https://www.huodongxing.com/event/2874911381700)
