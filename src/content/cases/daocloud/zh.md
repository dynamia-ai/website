---
title: "DaoCloud 使用 HAMi 构建灵活的 GPU 云"
company: "daocloud"
companyName: "DaoCloud"
logo: "/logos/company7.png"
date: "2025-12-02"
dateLabel: "2025.12.02"
sourceKind: "CNCF 案例 · 中文译文"
sourceUrl: "https://www.cncf.io/case-studies/daocloud/"
sourceLinkLabel: "查看 CNCF 原文 ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "关键数据来源：密瓜智能官网 ↗"
outcomes:
  - value: "10,000+"
    label: "跨平台 GPU 数量"
    detail: "D.run 与 DCE，覆盖 10+ 数据中心"
  - value: ">80%"
    label: "平均 GPU 利用率"
    detail: "部署 HAMi 后的单卡平均值"
  - value: "20–30%"
    label: "GPU 运营成本降低"
    detail: ""
---

## 面临的挑战

DaoCloud 运营两大面向 AI 负载的云原生平台：D.run 算力云为个人开发者和小团队提供公有 GPU 云；DaoCloud Enterprise（DCE）则是面向企业客户的私有 Kubernetes 平台，同时承载训练与推理。

随着两个平台的 GPU 需求快速增长，出现了几项挑战：

1. **整卡分配导致容量闲置。** 许多推理和轻量负载只用一部分 GPU 资源，但 GPU 通常按整卡分配，留下大量未充分使用的算力与显存，也限制了 GPU SKU 的设计。
2. **异构硬件管理困难。** DaoCloud 既需要支持主流 NVIDIA GPU，也需要集成多家国产加速器。专有 vGPU 方案增加许可费用，也使国产 GPU 难以获得同等支持。
3. **企业需要更强的多租户治理。** DCE 客户希望共享 GPU 池，同时具备部门级配额、基于队列的资源分配与清晰的团队隔离。
4. **必须保持云原生一致性。** DaoCloud 的核心战略围绕 Kubernetes 和开源技术展开。GPU 共享方案必须完全云原生、厂商中立，并与既有 CNCF 工具兼容。

| 关键成果 | 数据 |
| --- | --- |
| 覆盖数据中心 | 中国内地和香港超过 10 个 |
| 使用 vGPU 后平均 GPU 利用率 | 超过 80% |
| GPU 相关运营成本 | 降低 20%—30% |

## 解决方案

DaoCloud 采用 HAMi 作为 D.run 与 DCE 的统一 GPU 层。HAMi 在案例发布时为 CNCF Sandbox 项目，为 Kubernetes 集群内的异构加速器提供设备虚拟化、vGPU 切分与调度。

### 部署范围

HAMi 在 D.run 和 DCE 的生产环境中部署，涵盖 DaoCloud 自营 GPU 和企业客户拥有的 GPU。合计正在使用 HAMi 的 GPU 容量超过 10,000 张卡，分布于中国内地和香港的 10 多个数据中心。GPU 所属方因地区和租户而异，但 HAMi 为所有设备提供统一虚拟化与调度层。

### D.run 算力云：面向公有云用户的 vGPU SKU

DaoCloud 将 HAMi 集成到 D.run 各区域 Kubernetes 集群，实现细粒度共享和更高利用率。

- **vGPU 切分与受控超分：** 将物理 GPU 划分为明确算力和显存的多个切片。轻量推理任务使用部分 GPU，受控超分进一步提升集群总利用率。
- **基于 SKU 的 GPU 市场：** 将 vGPU 切片作为标准化 SKU 放入统一市场，用户按负载大小选择，而不必支付整卡费用。
- **多区域部署：** HAMi 支撑中国内地和香港 7 个活跃 D.run 区域，覆盖 10 多个数据中心。依据客户部署与硬件可用性，生产中单个区域可扩展到约 3,000 张 GPU 的集群。
- **支持国产加速器：** DaoCloud 扩展 HAMi 对国产 GPU 厂商的支持，在统一抽象层下以一致方式管理 NVIDIA 与国产卡。

![D.run 产品布局，来源：CNCF 原文。](/redesign/assets/524623d1953a5063ead0.png)
*D.run 产品布局，来源：CNCF 原文。*

### DaoCloud Enterprise：面向大型企业的共享 GPU 池

在 DCE 上，DaoCloud 基于 HAMi 构建集中 GPU 资源池，统一多个企业租户的容量。

- **统一资源池：** 企业用户向集中池贡献并使用 GPU，同时服务训练与推理。
- **配额、RBAC 与 vGPU 集成：** HAMi 的 vGPU 资源与已有配额及角色权限系统集成，将部门级和队列级 GPU 限额落实到 vGPU 层面。
- **简化 AI 工程师体验：** 算法工程师通过平台申请 GPU，无需关心底层硬件差异；HAMi 处理 vGPU 映射，提供顺畅的开发体验。

### 与社区共同建设 HAMi

DaoCloud 是 HAMi 最早、最活跃的贡献者之一。工程师持续将 D.run 与 DCE 的真实经验反馈给社区，与上游协作改进 GPU 超分、节点配置管理和异构硬件处理，并维护文档与部署指南，帮助其他云厂商在生产环境采用 HAMi。

> “借助 HAMi 统一的 vGPU 抽象，D.run 可以大规模、无缝地管理 NVIDIA 和国产 GPU。HAMi 不仅提高了 GPU 利用率，也加快了区域扩张与交付。”
>
> —— Captain，DaoCloud AI/LLM 基础设施产品负责人
>

## 实施效果

通过集成 HAMi，DaoCloud 将此前碎片化的 GPU 资源整合为更统一、高效、可扩展的 GPU 层，覆盖公有云和私有云。

D.run 从整卡分配转向 vGPU 切分后，GPU 利用率大幅提升。各区域单张 GPU 可以运行更多并发推理服务，用户只需为实际所需资源付费。

在 DCE 中，企业将 GPU 视为受配额和 RBAC 管理的公共资源池。该模式简化 GPU 管理、提高透明度，并加快新团队和项目接入。

跨两个平台，HAMi 的开放架构减少厂商依赖，使 NVIDIA 与国产加速器能够在统一控制平面下运行。

> “HAMi 与 DaoCloud 的关系不只是业务兼容，而是共同建设。作为 HAMi 最早的贡献者之一，我们见证了它从起步走向成熟。如今 HAMi 运行在 D.run 和 DCE 两个平台上，我们在真实环境中的改进也不断回流社区。
>
> HAMi 与 DaoCloud 有着相同的开源基因，我们会继续贡献，让真正的 vGPU 技术走向世界。”
>
> —— Captain，DaoCloud AI/LLM 基础设施产品负责人
>

### 关键成果

- 部署 HAMi 后，单卡平均 GPU 利用率超过 80%。
- 通过高效切分和超分，GPU 相关运营成本下降 20%—30%。
- NVIDIA 与国产 GPU 使用统一抽象层，实现硬件多样性而不增加运维复杂度。
- 配额与角色权限集成到 vGPU 层，治理更简单。
- HAMi 的模块化设计缩短集群部署和交付周期，加快区域扩张。
- DaoCloud 持续共同开发 HAMi、向上游贡献改进，增强开源协作。

<div class="case-source-note">
<p>原文：<a href="https://www.cncf.io/case-studies/daocloud/" target="_blank" rel="noopener">Building flexible GPU clouds with HAMi at DaoCloud ↗</a><br>发布方：Cloud Native Computing Foundation（CNCF） · 2025-12-02</p><p>本页为 CNCF 案例的中文翻译，保留原文技术信息与数据口径；并非 CNCF 官方中文版本。架构图沿用原文，图内英文保留。项目阶段及产品信息以文章发布时为准。</p><p>原文依 <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation 内容条款</a>使用，适用 <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>；本页进行了中文翻译和版式调整，品牌标识归各权利人所有。</p>
</div>
