---
title: "深信服如何基于 Kubernetes、Volcano 与 HAMi 构建企业 AI 算力平台"
company: "sangfor"
companyName: "深信服"
logo: "/redesign/assets/8d37763f47722bb132cf.svg"
date: "2026-09-08"
dateLabel: "2026.09.08"
sourceKind: "CNCF 案例 · 中文译文"
sourceUrl: "https://www.cncf.io/case-studies/sangfor/"
sourceLinkLabel: "查看 CNCF 原文 ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "关键数据来源：密瓜智能官网 ↗"
outcomes:
  - value: "3×+"
    label: "GPU 利用率提升"
    detail: ""
  - value: "8×+"
    label: "单卡模型承载量（1 → 8+）"
    detail: ""
  - value: "50%"
    label: "外部模型调用成本下降"
    detail: "40 万 → 20 万元/月，含平台智能路由收益"
---

深信服是中国领先的企业云计算与网络安全厂商。随着 AI 应用快速发展，深信服正在为内部研发团队和企业客户建设统一 AI 算力平台，支撑 AI 编程、数字员工、智能客服和销售 Agent 等场景。

随着平台规模扩大，GPU 利用率、资源隔离和调度效率成为关键瓶颈。深信服基于 Kubernetes、Volcano 和 HAMi 构建生产级 GPU 共享平台，让 Kubernetes 成为统一的 AI 资源控制平面。

| 指标 | 改进前 | 改进后 |
| --- | --- | --- |
| GPU 利用率 | 基线 | 提升超过 3 倍 |
| 每张 GPU 承载模型数 | 1 | 8 个以上 |
| 外部模型调用费用 | 40 万元/月 | 20 万元/月 |
| 模型故障恢复时间 | 约 1 小时 | 少于 10 分钟 |
| 3 倍峰值流量下成功率 | 不稳定 | 超过 95% |
| 支撑研发团队规模 | 有限 | 2,000 多名工程师 |

## 面临的挑战

### GPU 利用不足

传统模式中，一个推理服务独占一张 GPU。许多负载只使用少量显存和算力，却长期占据整卡，形成严重资源碎片。GPU 扩容速度甚至超过了业务增长速度。

### 多租户环境中的资源治理复杂

平台同时服务 AI 编程、数字员工、智能客服、销售 Agent、企业知识助手等负载。不同负载的 GPU 需求差异很大：有些需要长期驻留显存，有些则有明显波峰波谷。统一资源池管理和公平分配成为关键问题。

### 推理与批处理负载并存

平台并发运行在线推理、批量推理、分布式训练和 Agent 工作流。原生 Kubernetes GPU 调度无法满足这些复杂 AI 负载的需求。

## 解决方案：HAMi

> “HAMi 原生集成 Kubernetes，意味着零迁移成本。透明设备虚拟化让工作负载无需修改即可运行。”
>
> —— Jia Haojie，深信服云 AI 首席架构师
>

Kubernetes 为 AI 平台提供统一控制平面，但原生 GPU 调度按整卡分配资源，难以满足推理、多租户和异构 GPU 环境的需要。深信服分别引入 Volcano 和 HAMi，负责高级调度与 GPU 资源虚拟化。

选择 HAMi 的核心原因包括：

- **GPU 共享：** 显存粒度可低至 256MB、算力低至 1%，多个 Pod 可以在强隔离下共享同一张 GPU。
- **异构 GPU 支持：** 统一资源抽象，让多代 GPU 获得一致的调度体验。
- **开源生态：** Kubernetes 领域最活跃的开源 vGPU 项目之一，并持续与 Volcano Queues、vLLM 集成。

### 平台架构

平台分为两层。数据平面是请求路径：AI 应用经过 AI 算力网关的路由、治理与安全检查后，进入模型服务层，包括 OpenAI、Claude、DeepSeek 和本地推理。组件架构是算力底座：Volcano 负责作业调度，HAMi 负责 GPU 虚拟化、共享与隔离，Kubernetes 管理节点和设备插件，最终落到 NVIDIA、昇腾等异构 GPU 执行。

两层在模型服务与 Volcano 之间衔接，完成从请求到算力的端到端链路。

![深信服 AI 平台的数据平面与算力组件架构，来源：CNCF 原文。](/redesign/assets/1e1ccd5f43f3ad06da45.jpg)
*深信服 AI 平台的数据平面与算力组件架构，来源：CNCF 原文。*

### GPU 池化：改进前后

改进前采用专用模式，一张卡仅运行一个模型。大模型尚能填满显存，小模型却只使用 15%—20%，其余资源闲置。大小模型无法共存，资源碎片严重。

vGPU 切分带来两项核心收益：

- **大小模型混合部署：** 大模型占用单卡主要份额，例如 70%，剩余切片分配给多个小模型，利用原本闲置的算力。
- **提升小模型部署密度：** 单卡可以承载 8 倍及以上的小模型实例，显著减少新增 GPU 的需求。

总体结果是 GPU 利用率提升超过 3 倍，单卡模型密度提升超过 8 倍。

![GPU 池化前后的部署方式对比，来源：CNCF 原文。](/redesign/assets/80cd9ed10ba3520b4d97.jpg)
*GPU 池化前后的部署方式对比，来源：CNCF 原文。*

### Volcano + HAMi：协同调度

只有 GPU 共享还不足以支撑生产。Volcano 与 HAMi 结合，实现设备资源和作业调度的统一管理：

- **设备状态维护：** GPU 健康监测、自动故障隔离与资源自动回收。
- **资源声明治理：** 自动补齐资源字段、统一计算配额、提前拒绝无效请求。
- **调度事务隔离：** 将资源试算与实际占用解耦，保证状态一致。
- **Gang 与 LWS 支持：** Volcano 编排作业，HAMi 分配 GPU，整组协同调度。

Volcano 决定负载何时、在哪运行，HAMi 决定 GPU 资源如何共享和分配。

![工作负载与调度组件的协作流程，来源：CNCF 原文。](/redesign/assets/80cd9ed10ba3520b4d97.jpg)
*工作负载与调度组件的协作流程，来源：CNCF 原文。*

## 实施效果

### GPU 利用率提升超过 3 倍

HAMi 的 vGPU 切分让多个推理服务共享一张 GPU，按需分配显存和算力。共享 GPU 池消除资源碎片，使同样硬件能够运行更多负载。

### 单卡模型密度提升超过 8 倍

过去需要 3 张 GPU 的推理负载，现在可放入 1—2 张 GPU。原文此处列出的最小算力切片为 1%、最小显存切片为 1MB，使各模型获得精确的资源配额。

### 外部模型调用费用降低 50%

结合智能路由，将简单问题交给低成本模型、复杂问题交给高端模型，外部模型调用费用从每月 40 万元降到 20 万元；安全护栏同时维持成本与质量之间的平衡。

### 平台稳定性显著提升

模型故障恢复时间从 1 小时缩短到 10 分钟以内。在 3 倍流量压力测试下，成功率保持在 95% 以上。设备健康监测和自动故障隔离将故障 GPU 排除在调度路径之外。

### 支撑 2,000 多人的研发团队

平台已支撑 AI 编程、企业 Agent、智能客服、数字员工等多个生产场景，覆盖 2,000 多名研发工程师的日常使用。

## 实践经验

### GPU 共享比单纯增加 GPU 更重要

大部分推理负载无法用满整张 GPU。在采购更多硬件之前，优先共享 GPU，可以获得更高、更快的投资回报。

### 调度与资源虚拟化应当解耦

HAMi 负责资源抽象，Volcano 负责调度策略。解耦后，各层可以独立演进。只有共享、没有智能调度，任务放置难以达到最优；只有调度、没有 GPU 虚拟化，则缺少可供精细调度的资源。

### Kubernetes 正成为 AI 资源控制平面

AI 基础设施正沿云原生路径发展，而不是另建一套孤立的资源管理系统。Kubernetes、Volcano 与 HAMi 的组合，使企业不必引入新的管理范式，就能获得企业级 GPU 管理能力。

## 后续计划

深信服将继续与 HAMi 社区合作，推动 Kubernetes 成为 AI 负载的统一控制平面：

- 加入 HAMi DRA 生态，推进 Kubernetes 原生 GPU 资源管理。
- 通过 HAMi 的统一抽象，扩展昇腾等异构 GPU 支持。
- 将生产级调度策略和运维最佳实践贡献回 Volcano 与 HAMi 社区。

进一步了解：[HAMi GitHub](https://github.com/Project-HAMi/HAMi) · [Volcano GitHub](https://github.com/volcano-sh/volcano)。

<div class="case-source-note">
<p>原文：<a href="https://www.cncf.io/case-studies/sangfor/" target="_blank" rel="noopener">How Sangfor Built an Enterprise AI Compute Platform with Kubernetes, Volcano, and HAMi ↗</a><br>发布方：Cloud Native Computing Foundation（CNCF） · 2026-09-08</p><p>本页为 CNCF 案例的中文翻译，保留原文技术信息与数据口径；并非 CNCF 官方中文版本。架构图沿用原文，图内英文保留。项目阶段及产品信息以文章发布时为准。</p><p>原文依 <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation 内容条款</a>使用，适用 <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>；本页进行了中文翻译和版式调整，品牌标识归各权利人所有。</p><p class="fact-note">译注：原文在选型段落列出 256MB 显存粒度，在成效段落列出 1MB；译文保留原文不同表述。</p>
</div>
