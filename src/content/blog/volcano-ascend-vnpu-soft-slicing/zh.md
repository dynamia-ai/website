---
title: 'HAMi 2.10 解读（二）| 一张昇腾卡切给两个 Pod：Volcano + HAMi-core vNPU 软切分实测'
linktitle: Volcano + HAMi vNPU 软切分实测
date: '2026-08-26'
excerpt: >-
  GPU 有 HAMi 做显存硬隔离，昇腾 NPU 呢？本文是 HAMi 2.10 解读系列第二篇：在昇腾 310P3
  真机上验证 Volcano 调度 + HAMi-core 软切分——容器内只见 8192 MiB 切片，两个 Pod binpack
  到同一张物理卡，监控指标如实上报。
author: 宋净超（Jimmy Song）
tags:
  - HAMi
  - Volcano
  - 昇腾
  - Ascend
  - NPU
  - vNPU
  - GPU 共享
  - Kubernetes
category: Technical Deep Dive
language: zh
coverTitle: HAMi 2.10 解读（二）
---

> GPU 有 HAMi 做显存硬隔离，昇腾 NPU 呢？本文是 HAMi 2.10 解读系列第二篇：在昇腾 310P3 真机上验证 Volcano 调度 + HAMi-core 软切分——容器内只见 8192 MiB 切片，两个 Pod binpack 到同一张物理卡，监控指标如实上报。

[上一篇](/blog/kai-scheduler-hami-gpu-memory-hard-isolation/)我们实测了 KAI Scheduler + HAMi-core 在 NVIDIA GPU 上的显存硬隔离：两个 Pod 共享一张 T4，谁也别想多占 1 MiB。有读者接着问：**昇腾 NPU 呢？**

昇腾是国内 AI 推理的主力卡。一张 310P3 有 21.5 GiB 显存，如果每个推理服务独占一张卡，浪费同样惊人；可 NPU 的共享比 GPU 更容易踩坑——vNPU、硬切分、软切分、Volcano 模式，一堆概念搅在一起，光是分清“谁在切卡、切出来的是什么”就要花掉半天。

本文是 HAMi 2.10 解读系列第二篇，聚焦 HAMi v2.10 中昇腾管理的一次重要升级：**用 Volcano 调度器运行 hami-vnpu-core 软切分的 vNPU**，让批量调度语义（队列、Gang、binpack）与容器级隔离（在昇腾 API 层强制生效的显存与算力上限）协同工作。

先说结论：我们在一台昇腾 310P3 aarch64 服务器的单节点 Kubernetes 集群上跑通了完整链路——申请 8192 MiB 切片的容器，容器内 `npu-smi` 恰好只看到 8192 MiB；第二个 Pod 以 binpack 方式落到同一张物理卡、拿到独立切片；插件的 Prometheus 端点如实上报了两个容器的配额。

## 背景：Volcano、昇腾与 HAMi 的三角关系

三个角色先各自就位：

**Volcano** 是 Kubernetes 原生的批处理与 AI 工作负载调度器，CNCF 孵化项目，提供队列、Gang 调度、binpack/spread 等能力，是很多 AI 集群的调度器首选。

**昇腾（Ascend）NPU** 是华为的 AI 加速器。从一张物理 NPU 上划出、提供给容器使用的逻辑设备就叫 **vNPU**——一张 21.5 GiB 的卡可以划成 8 GiB 加 8 GiB 两份切片，剩余约 5.5 GiB。

**HAMi** 负责“守规矩”：它面向昇腾的运行时隔离组件叫 **hami-vnpu-core**（注入 `libvnpu.so`），在昇腾 API 层强制执行显存与算力配额。

HAMi v2.10 对昇腾的管理做了一次整体升级：新增 Volcano 集成、让基于模板的 vNPU 与 HAMi-core 节点在同一集群共存的异构管理能力，以及 vNPU HAMi-core 监控。本文讲的正是其中“Volcano + 软切分”这条路径。

## 先分清：NPU、vNPU、硬切分、软切分

这是本话题最容易产生歧义的地方，先把层次分开：

| 层次 | 回答的问题 |
|-|-|
| NPU / vNPU | 你拿到的是什么设备：vNPU 是从物理 NPU 划出、提供给容器的逻辑设备 |
| 硬切分 / 软切分 | 这个虚拟设备如何实现隔离 |
| HAMi-core | 谁在容器内执行软切分配额 |
| HAMi / Volcano | 由谁决定 Pod 用哪张卡、用多少资源 |

**硬切分**由昇腾驱动/固件的虚拟化能力完成，用户只能从预定义模板中选择：`vir05_1c_16g` 代表固定数量的 AI Core、AI CPU 和 16 GiB 显存，创建后设备层会产生一个真正的 vNPU 实例（可用 `npu-smi info -t template-info` 查询支持的模板）。

**软切分**不在硬件里真正创建 vNPU，而是让多个容器共享同一张物理 NPU，在容器内注入 `libvnpu.so`，拦截应用对昇腾运行时 API 的调用并记账：

![软切分原理：应用容器调用昇腾 API，libvnpu.so 拦截并记账，只放行配额内的显存与算力，多个容器共享物理 NPU](/images/blog/volcano-ascend-vnpu-soft-slicing/vnpu-intercept.png)

以 8192 MiB 配额为例：应用查询设备时只看到 8192 MiB，申请显存由 `libvnpu.so` 记账，超过配额的请求被运行时拦截层阻止。两者对比：

|  | 硬切分 | 软切分 |
|-|-|-|
| 隔离边界 | 设备虚拟化层强制，更强 | 软件运行时拦截，不等于 SR-IOV 级硬件边界 |
| 规格 | 仅厂商模板，例如 8 GiB、16 GiB 档位 | 任意 MiB、算力比例 |
| 切分单元 | AI Core、AI CPU、显存、DVPP | 显存与算力配额 |
| 前置条件 | 芯片/驱动需支持对应模板 | 依赖 `libvnpu.so` 注入与驱动兼容，当前仅支持 ARM |

可以把两者理解成：**硬切分是在房子里真正砌墙；软切分是大家共用房子，但每个门口都有一个严格记账和限流的管理员。**

注意，本文所说的“软切分 vNPU”是 Kubernetes/HAMi 视角下的逻辑切片，并不是通过 `npu-smi ... create-vnpu` 创建的昇腾硬件 vNPU。

## Volcano 调度昇腾 vNPU 的两种方式

Volcano 调度昇腾虚拟 NPU 有**两种不同方式**，很容易混淆。先把它讲清楚，能省掉好几个小时的排错：

|  | MindCluster 模式 | HAMi 模式 |
|-|-|-|
| Volcano 开关 | `deviceshare.AscendMindClusterVNPUEnable` | `deviceshare.AscendHAMiVNPUEnable` |
| 提供方 | Volcano 原生昇腾插件 | Project-HAMi/ascend-device-plugin |
| 模板 | `vir04_3c_ndvpp`（带 `dvpp` 维度） | `vir05_1c_16g`（仅 `memory`/`aiCore`/`aiCPU` 字段） |
| 切分方式 | 驱动模板（硬切分） | 默认走驱动模板，Pod 设置 `huawei.com/vnpu-mode: hami-core` 后走软切分 |
| 资源名 | `huawei.com/npu-core` | `huawei.com/Ascend310P`、`-memory` |

本文讲的是 **HAMi 模式**下的 **`hami-vnpu-core` 软切分**。特别提醒：HAMi 模式并不等于软切分模式——同一个 ascend-device-plugin 同时支持模板硬切分与 hami-vnpu-core 软切分，由 Pod 的注解选择路径。这也是两种 Volcano 模式里唯一做运行时拦截的一种：不是把卡预先切成固定的虚拟化模板，而是在用户态拦截昇腾调用，在运行时按容器强制显存与算力上限。**Volcano 决定哪个 Pod 拿到哪个切片，HAMi-core 让这个决定真正生效。**

## 这次集成到底新增了什么

先纠正一个名字：**HAMi-core** 是这一类容器内运行时隔离技术的统称，最早主要指 NVIDIA 的 `libvgpu.so`；**hami-vnpu-core** 是专门面向昇腾 NPU 的实现，实际注入的是 `libvnpu.so`。

昇腾软切分能力本身并不是新东西：相关支持 2026 年 4 月就已进入代码，在 HAMi 2.9 中链路已经可用。HAMi 2.10 的 Volcano 集成没有重新发明软切分，而是把“分配者”从 HAMi Scheduler 换成了 Volcano，底下两层原样复用：

![HAMi 2.9 用 HAMi Scheduler 调度，HAMi 2.10 换成 Volcano Scheduler，ascend-device-plugin 与 hami-vnpu-core 两层原样复用](/images/blog/volcano-ascend-vnpu-soft-slicing/volcano-path.png)

| 层次 | HAMi 2.9 路径 | Volcano 集成路径 |
|-|-|-|
| 调度器 | HAMi Scheduler | Volcano Scheduler |
| 设备发现/挂载 | ascend-device-plugin | 同一个 ascend-device-plugin |
| 软切分执行 | hami-vnpu-core（`libvnpu.so`） | 同一个 hami-vnpu-core |
| 显存、算力隔离 | 已支持 | 复用原有能力 |
| 队列、Gang 调度 | 不是重点 | Volcano 提供 |
| binpack / spread | HAMi 策略 | Volcano deviceshare 策略 |
| 监控及软硬混合管理 | 相对早期 | 2.10 进一步补全 |

Volcano 现在能理解这些 HAMi 昇腾资源，并决定：哪个 Pod 使用哪张物理 NPU、多个 Pod 是否 binpack 到同一张卡、整组训练 Pod 是否满足 Gang 条件、使用哪个队列、优先级和抢占策略。准确的说法是：**这次集成完成的是“Volcano 调度昇腾 HAMi-core 软切分资源”，并补充监控及软硬切分混合管理；昇腾软切分能力本身早已存在。**

## 集成链路如何工作

这条链路有三个分工：

- **Volcano 的 `deviceshare` 插件**从 `hami-scheduler-device` ConfigMap（配合 `AscendHAMiVNPUEnable: "true"`）读取 vNPU 规格，并按 `binpack` 或 `spread` 策略决定每个 Pod 由哪个节点、哪张卡服务；
- **`ascend-device-plugin` DaemonSet** 向节点注册 `huawei.com/Ascend310P`（卡数）与 `huawei.com/Ascend310P-memory`（MiB）扩展资源，并把 HAMi-core 资产（`libvnpu.so` 和 `ld.so.preload`）拷贝到宿主机 `/usr/local/hami-vnpu-core/`；
- **HAMi-core（`libvnpu.so`）** 经 Ascend Docker Runtime 的 preload 机制注入业务容器，强制执行调度器选定的切片。

![集成链路：ascend-device-plugin 上报容量，Volcano deviceshare 插件读取模板并绑定切片，libvnpu.so 拦截昇腾调用，按容器强制上限并在 9395 端口导出指标](/images/blog/volcano-ascend-vnpu-soft-slicing/integration-chain.png)

Pod 侧的契约很简洁，四样东西缺一不可：

```yaml
spec:
  schedulerName: volcano        # 交给 Volcano 调度
  runtimeClassName: ascend      # Ascend Docker Runtime
  containers:
    - name: npu
      resources:
        limits:
          huawei.com/Ascend310P: "1"          # 1 个 vNPU
          huawei.com/Ascend310P-memory: "8192" # 8192 MiB 显存切片
```

外加注解 `huawei.com/vnpu-mode: hami-core`。**少了这个注解，Pod 会退回模板路径，在纯软切分节点上可能一直 Pending**——这是最常见的翻车点。

## 真机验证：容器只见切片，两个 Pod 共卡

验证环境：麒麟 V10 aarch64 单节点 Kubernetes 1.28 集群，2× 昇腾 310P3（驱动/npu-smi 25.5.1），containerd 1.7.1。Volcano 按实验 13 从源码编译（撰写本文时软切分要求 1.16，而稳定版还停在 v1.15.1），插件使用官方 ascend-device-plugin v1.4.0。

插件注册后，节点上报 14 个 vNPU（2 卡 × 7，与 `vDeviceCount: 7` 一致）与 43054 MiB 可分配显存。

**验证一：容器只看到自己的切片。** 第一个 Pod 内的 `npu-smi info` 显示的是 0 / 8192 MB 的设备，而宿主机在同一张卡上看到的是 1848 / 21525 MB：

```text
$ kubectl exec ascend-vnpu-check -- npu-smi info
[INFO limiter::manager] [Manager] Registered as Global Manager #0 (PID: 10).
  Compute limit: 1, Memory limit: 8192, FixedShare: false
| 0  0 | 0000:81:00.0 | 0  0 / 8192 |
```

注入的环境变量也印证了接线：`NPU_MEM_QUOTA=8192`、`ASCEND_VISIBLE_DEVICES=0`。`libvnpu.so` 已把设备查询改写为容器的配额。

**验证二：binpack 让两个 Pod 共享一张物理卡。** 第二个同规格的 Pod 落在了同一个 Bus-Id `0000:81:00.0` 上，各自拥有独立的 8192 MiB 窗口，并作为 `Global Manager #1` 注册进与 Pod 1 的 `#0` 相同的共享注册表。节点的已分配资源说的是同一件事：`huawei.com/Ascend310P 2`（共 14）、`Ascend310P-memory 16384`（共 43054）——两个 8192 MiB 切片打包进一张 21.5 GiB 的卡，而不是分散到两张卡。

**验证三：容器级监控指标正常导出。** 插件（不是业务 Pod）在 `:9395` 上提供 Prometheus 指标：

```text
hami_vgpu_memory_limit_bytes{...,pod="ascend-vnpu-check",vdevice_index="0"} 8.589934592e+09
hami_vgpu_memory_limit_bytes{...,pod="ascend-vnpu-check-2",vdevice_index="0"} 8.589934592e+09
```

`8.589934592e+09` 字节恰好是 8192 MiB，与两个 Pod 的申请值一致。该端点还导出实时用量与利用率指标，覆盖宿主机/容器/vdevice 三层。

| 验证项 | 结果 | 证据 |
|-|-|-|
| 显存切片隔离 | 通过 | 容器内 `0 / 8192`，宿主机 `1848 / 21525` |
| binpack 共卡 | 通过 | 两个 Pod 同为 Bus-Id `0000:81:00.0`，`Global Manager #0/#1` |
| 资源计量 | 通过 | 节点已分配 2 vNPU、16384 MiB |
| 监控 | 通过 | `:9395` 导出宿主机/容器/vdevice 三层指标 |

## 动手前值得知道的坑

真机跑一遍才知道，坑都在细节里：

- **`libvnpu.so` 必须与 NPU 驱动匹配。** 不匹配不会报错，容器内 `npu-smi` 只是永远卡在 `Initialize SchedulerClient...`。请从与驱动匹配的官方镜像版本拷贝资产并校验 md5。
- **Docker 与 containerd 的镜像存储是隔离的。** 用 `ctr -n k8s.io images import` 导入，否则等着收 `ErrImageNeverPull`。
- **Helm 里镜像拉取策略的 key 是 `basic.image_pull_policy`**（下划线），不是 `scheduler.imagePullPolicy`。
- **v1.4.0 不注册 `-core` 资源。** Pod spec 只需要 `huawei.com/Ascend310P`（卡数）与 `huawei.com/Ascend310P-memory`（MiB）。
- **指标在插件 Pod 上。** 在业务 Pod 里 curl `:9395` 毫无响应，要按 label 选中 DaemonSet Pod。
- **卸载 Volcano 后 `volcano-system` 可能卡在 Terminating**（webhook 已删除之后），清理 namespace 的 finalizer 即可解除。

最后重复一次边界：这里的软切分是运行时 API 层的强制（`libvnpu.so` 软件拦截），不是 SR-IOV 式的硬件安全边界，这一点与 HAMi-core 在 GPU 上的定性相同。可信团队内部共享、推理混部足够用；不可信多租户请评估硬切分方案。

## 总结

- 昇腾的 vNPU 有两种实现：驱动模板**硬切分**（砌墙）与 hami-vnpu-core **软切分**（共用房子 + 门口记账管理员），后者支持任意 MiB 与算力比例；
- HAMi 2.10 的 Volcano 集成换的是“分配者”（Volcano Scheduler 接管队列、Gang、binpack），设备挂载与运行时隔离两层原样复用，并补全了监控与软硬混合管理；
- 真机验证：容器内只见 8192 MiB 切片、两个 Pod binpack 同一张物理卡、容器级监控如实上报——**在昇腾上，“说好一家一半，谁也别想多占”同样成立。**

至此，HAMi 2.10 解读系列已经覆盖了 NVIDIA GPU（KAI Scheduler）与昇腾 NPU（Volcano）两条调度器集成路径。共同的模式是：调度器负责分配，HAMi-core 负责让分配真正生效。

作者：宋净超（Jimmy Song），来自密瓜智能。

## 系列阅读

- 本系列上一篇：[《HAMi 2.10 解读（一）：实测 KAI Scheduler + HAMi GPU 显存硬隔离》](/blog/kai-scheduler-hami-gpu-memory-hard-isolation/)
- 本系列下一篇：[《HAMi 2.10 解读（三）：既要独占、又要装箱、还要 NUMA 亲和——调度策略可以组合了》](/blog/hami-composable-scheduler-policies/)
- [《HAMi v2.10.0 发布：Flexible MIG、可组合调度策略与更广阔的加速器生态》](https://project-hami.io/zh/blog/hami-v2-10-0-release)
- 复现实测：[《实验 13：用 Volcano + HAMi-core 软切分昇腾 310P3 vNPU》](https://project-hami.io/zh/tutorials/labs/volcano-ascend-vnpu)

## 参考资料

- 本文 HAMi 官网原文（含完整命令与真实输出）：<https://project-hami.io/zh/blog/volcano-ascend-vnpu-soft-slicing>
- HAMi v2.10.0 发布公告：<https://project-hami.io/zh/blog/hami-v2-10-0-release>
- 实验 13 教程（真机完整复现步骤）：<https://project-hami.io/zh/tutorials/labs/volcano-ascend-vnpu>
- 用户指南《Volcano 中的华为昇腾设备》：<https://project-hami.io/zh/docs/installation/how-to-use-volcano-ascend>
- 用户指南《启用昇腾共享》：<https://project-hami.io/zh/docs/userguide/ascend-device/enable-ascend-sharing>
- 昇腾硬切分参考实践（昇腾社区）：<https://www.hiascend.com/developer/techArticles/20251212-1>
- 相关仓库：
  - ascend-device-plugin：<https://github.com/Project-HAMi/ascend-device-plugin>
  - hami-vnpu-core：<https://github.com/Project-HAMi/hami-vnpu-core>
  - Volcano：<https://github.com/volcano-sh/volcano>
