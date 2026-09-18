# 网站博客内容契约

依据 `src/lib/blog-server.ts`、`src/types/blog.ts` 和现有文章。维护者改动内容机制后需同步本契约。

## 路径与字段

文章：`src/content/blog/<slug>/<locale>.md`。新 slug 使用英文小写、数字和连字符；更新使用已有 slug（历史 slug 可能含点号）。`hello-world` 是读取器隐藏的示例文章，不作为投稿目标。locale 为 zh/en（当前博客页面未接入 de），一篇中文稿不要求同时生成其他语言。博客正文已由 Markdown 内容文件承载，不写进 UI 字典。

```yaml
---
title: '对外文章标题'
linktitle: '文字封面短标题（选填）'
coverTitle: '网站文字封面标题（选填）'
date: '2026-09-18'
excerpt: '供列表和 SEO 使用的摘要。'
author: '对外署名'
tags:
  - HAMi
category: 'Company News'
coverDisplay: 'image'
coverImage: '/images/blog/example-post/cover.jpg'
---
```

以上只是字段示例，不可把示例原样发布。不要写 `language`（语言由文件名决定，遵守 AGENTS）。新流程要求 title/date/excerpt/author/category/tags 非空；date 必须真实有效 YYYY-MM-DD 字符串。可选 linktitle/coverTitle 不需要时删除。category 必须使用 dictionary/en.json 与 dictionary/zh.json 的 blogUI.categories 中共有的分类键；新分类需要改字典，交维护者另做。

选择“上传图片”同时写 coverDisplay: image 和 coverImage；选择“网站文字封面”写 coverDisplay: text 并省略 coverImage，按需写 coverTitle。缺少 coverDisplay 时保留旧的文字封面展示，不能只写 coverImage 就宣称列表图片生效。不能凭空承诺任意封面排版、颜色、字号可编辑；这些属于组件设计。图片封面用于列表卡片及分享元数据；详情页仍沿用现有文章头部，没有新增独立头图。横版 16:9 是建议，最终裁切以实际预览为准。

当前读取器没有 draft/published/scheduledAt 通用过滤；未来日期也会进入列表。不得增加这些无效字段宣称文章被隐藏。待审稿只能留在未合并分支，定时发布需另外由维护者实施。

## 正文转换

- 模板字段不进入正文；只取“正文开始”和“正文结束”之间内容。该区间内部标题转换为 h2/h3 起的 Markdown 标题，文章 title 由页面展示。
- 支持段落、粗体、斜体、列表、引用、代码块、公开 HTTPS 链接、站内绝对路径、简单 GFM 表格、本地图片与图注。
- 不允许原始 HTML（包括 HTML 注释）、JSX/MDX、脚本、iframe 或带可执行协议的链接。代码示例放代码块仍可包含 HTML 字符；不会作为实际 HTML 注入。
- 合并单元格、飞书多维表格/电子表格、音视频、嵌套卡片、画板、同步块、附件不是普通 Markdown。先列明不支持部分，给用户纯文本/简单表格/插图方案；没有授权不删除实质内容，也不顺带改网站。
- 外链图片须由用户插入飞书后以 CLI 下载；发布后的图片均指向本篇的本地资源。每张图片需要非空替代文本。不上传整个原稿、未引用素材、评论或飞书配置。
- 图片文件最多 10 MiB，文章图片总量最多 40 MiB；超限先做保真压缩并检查清晰度，无法满足就交维护者，不改检查器。此为新编辑流程预算，不追溯重写旧文章。

## 源稿与更新

仓库不存飞书正文快照、内部备注或完整文档 URL。PR 内以文档 ID 的 SHA-256、revision、读取时间和目标 slug 留痕；内部文档 URL 只在用户私有任务里展示。映射发生冲突时询问用户，不能覆盖另一篇。

原稿修改不会自动同步已上线文章；市场同事必须再次把链接交给 Agent。文档本身也不会因为官网发布而被自动改写。日期只表示文章日期，不是任务调度器。
