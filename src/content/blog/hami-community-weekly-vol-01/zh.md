---
title: "社区周报 Vol.01：相聚 KubeCon、CNCF 社区奖项与开源生态新进展"
date: "2026-11-20"
excerpt: "HAMi 社区周报第一期回顾 KubeCon NA 2026、gpu-descheduler 开源、HAMi-DRA v0.2.4 发布、CNCF 社区奖项和 Vultr 开源联盟合作，并预告近期社区活动。"
author: "密瓜智能"
category: "Community & Events"
coverDisplay: "text"
tags: ["HAMi", "社区周报", "KubeCon", "开源社区"]
---

**本期周报｜2026.11.09 – 2026.11.13**

从本周起，**「 社区周报」将每周与大家见面！**

我们希望通过这一栏目，定期汇总 HAMi 的**技术进展、社区例会、贡献者动态、生态合作及活动资讯**，让开发者和社区伙伴更方便地了解项目最新动态，也为想要参与社区的朋友提供信息入口。

接下来，一起回顾本周 HAMi 社区的精彩动态！

## 本周速览

- **技术交流：** HAMi 亮相 KubeCon NA 2026
- **社区荣誉：** Jimmy Song 荣获 2026 CNCF Lorem Ipsum Award
- **生态合作：** HAMi 正式加入 Vultr Open Source Alliance，成为六家创始成员之一。
- **活动预告**：GOTC 2026、COSCon'26 即将举行
- **GitHub 动态**：累计完成 109 次代码提交、62 个 PR 合并，30 余位贡献者参与，Star 突破 5,000！

![HAMi 社区周报第一期的技术进展与 GitHub 数据](/images/blog/hami-community-weekly-vol-01/weekly-summary-zh.png)

## 01｜HAMi 社区动态

### gpu-descheduler

HAMi 生态迎来新项目 **gpu-descheduler，**该项目面向 HAMi GPU 虚拟化集群，探索通过 GPU 负载重新调度来减少资源碎片、提高集群资源利用效率。

项目已公开开源，中英文用户指南也已上线，欢迎感兴趣的开发者关注和参与。

项目地址：[https://github.com/Project-HAMi/gpu-descheduler](https://github.com/Project-HAMi/gpu-descheduler)

### HAMi-DRA v0.2.4 发布

11 月 12 日，HAMi-DRA 发布 v0.2.4 版本，持续完善从 Device Plugin 向 Kubernetes DRA 迁移的相关方案。

此外社区还推进了 NUMA 调度优化、Remote GPU 监控与异常恢复、HAMi-WebUI 问题修复等工作。

### HAMi 亮相 KubeCon NA 2026

11 月 9 日至 12 日，[**HAMi 社区亮相美国盐湖城 KubeCon NA 2026**](https://mp.weixin.qq.com/s/Z7eFnB2FzU0umpSMzGqGWg)，参与 Maintainer Track、ContribFest 等技术活动，并在 CNCF Project Pavilion 与全球开发者面对面交流。

![KubeCon NA 2026 的 HAMi 项目展区现场](/images/blog/hami-community-weekly-vol-01/kubecon-pavilion.jpg)
![KubeCon NA 2026 会场展示 CNCF 孵化项目](/images/blog/hami-community-weekly-vol-01/kubecon-incubated-projects.jpg)

### 社区 Manager 荣获 CNCF 社区奖项

在本届 KubeCon NA 大会上，[**来自密瓜智能团队的HAMi 社区 Manager 宋净超（Jimmy Song）荣获 2026 CNCF Lorem Ipsum Award**](https://mp.weixin.qq.com/s/NFjabD75sV2GF-x12mGULQ)。

该奖项旨在表彰为 CNCF 及其托管项目的文档建设作出突出贡献的社区成员。

过去一年，Jimmy 持续推动 HAMi 社区生态建设，包括技术内容与文档建设、社区活动组织、开发者交流及生态合作等工作。

祝贺 Jimmy，也感谢每一位参与 HAMi 建设的维护者、贡献者、用户及生态伙伴！

![Jimmy Song 获 CNCF 社区奖项的颁奖现场](/images/blog/hami-community-weekly-vol-01/cncf-award-ceremony.jpg)

### HAMi 正式加入 Vultr 开源联盟

11 月 11 日，HAMi 正式宣布加入 **Vultr Open Source Alliance（Vultr 开源联盟）**，成为联盟六家创始成员之一。

此次加入联盟，为 HAMi 探索 GPU 共享技术与云 GPU 基础设施、Kubernetes 环境的结合带来了更多合作机会。

未来，社区期待进一步探索部署指南、参考架构及 GPU 共享实践资源，让更多开发者能够在真实环境中评估和使用 HAMi。

**相关阅读：** [HAMi Joins the Vultr Open Source Alliance](https://discover.vultr.com/open-source)

![HAMi 加入 Vultr 开源联盟的宣传图](/images/blog/hami-community-weekly-vol-01/vultr-alliance.png)

## 02｜社区例会速览

### 中文社区例会｜11 月 6 日

- **v2.11.0 文档维护：** 讨论了官网文档升级、PR 合并及 Metrics 文档补充等工作。相关文档更新已在随后一周持续推进。
- **设备文档优化：** 计划按设备厂商整理文档导航，方便用户快速查找对应设备的使用说明。
- **上游协作探索：** 社向 Kubernetes 设备驱动上游贡献 GPU 显存限制相关能力的可行性，后续仍需结合上游沟通结果进一步评估；

### Global Community Meeting｜11 月 11 日

- **v2.12 版本规划：** 初步交流了下一版本的发展方向，具体路线图将在 KubeCon 后进一步同步。
- **设备配置校验：** 贡献者 Sankalp 提议新增配置校验命令，帮助用户在配置 Kubernetes 设备访问前检查相关设置。该提议将继续通过 GitHub Issue 讨论。
- **LFX Mentorship：** 开始筹备新一期导师计划项目提案，后续将结合 HAMi Roadmap 进一步确定选题。

![HAMi 社区例会宣传图及入会二维码](/images/blog/hami-community-weekly-vol-01/community-meeting-qr.png)

## 03｜近期社区活动

### 活动预告｜GOTC 2026

- 时间：11 月 14 日
- 地点：北京·通明湖会展中心
- 展位：C31

HAMi 将亮相 GOTC 2026，与开发者交流 GPU 共享及异构算力调度实践。

本次大会现场还设置了「游园 Agent」与「展位 NPC」等互动任务，参与打卡即可积累 Token 积分、兑换精美礼品。

欢迎来 C31 展位交流，领取 HAMi 社区专属周边！

![GOTC 2026 活动海报及报名二维码](/images/blog/hami-community-weekly-vol-01/gotc-poster-qr.png)

### **活动预告｜COSCon'26**

- 时间：11 月 14—15 日
- 地点：杭州·云谷中心
- 展位：D6

HAMi 将亮相 COSCon'26开源年会，与开源开发者及社区伙伴交流，共同探讨开源技术与生态发展。

![COSCon 2026 活动海报及报名二维码](/images/blog/hami-community-weekly-vol-01/coscon-poster-qr.png)

### 开源走进高校：首战落地复旦

- **时间：** 2026 年 11 月 13 日
- **地点：** 上海 · 复旦大学相辉堂‘

“开源走进高校”系列活动首站落地复旦大学，HAMi 社区参与交流，分享 GPU 共享与异构算力管理相关实践。

**相关阅读：**https://mp.weixin.qq.com/s/zKenZmIfGLvHnERfaQ1sJw

![复旦大学开源论坛海报及活动二维码](/images/blog/hami-community-weekly-vol-01/fudan-forum-poster-qr.png)

**让异构算力因开源而好用。我们下周见！**
