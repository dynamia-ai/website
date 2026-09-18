# 维护者：博客编辑流程落地与验收

## 已核验的仓库现状（2026-09-18）

- 基线 main：9899cab3abfc42f57c881ea8121845789d098ba6。
- Next.js 15，博客读取 `src/content/blog/<slug>/<locale>.md`，图片位于 `public/images/blog/`。
- 根目录有 AGENTS.md；基线没有 `.agents/skills/`。`src/app/.well-known/agent-skills/agent-discovery/SKILL.md/route.ts` 是网站对外返回 Skill 内容的路由，不是团队的编辑 Skill 安装位置。
- 博客正文页面只接入 en/zh；全站支持 de 不等于博客支持德文。基线列表忽略 coverImage，本变更通过显式 coverDisplay: image 开启图片封面，加载失败时回退文字封面；旧文章没有此字段，保持原展示。
- 渲染器启用原始 HTML，未通用处理 draft/定时发布。此流程只接受普通 Markdown，并把草稿留在内容分支。
- 基线仓库树没有 `.github/workflows/`；README 介绍 Vercel，但这不证明当前生产部署绑定、预览域名或访问控制。GitHub branch protection API 返回 404，无法据此确认保护已启用或未启用（也可能缺读取权限）。以下设置必须由管理员实查。

## 一次性启用

1. 维护者先审核并合并此工具/文档变更。这是流程建设 PR，不是市场内容 PR；不要顺带混入文章。
2. 在 GitHub 的 main ruleset/branch protection 中要求 PR、至少一名维护者审核、推送后撤销过期审批、禁止强推/删除，并限制绕过者。不向市场授予管理/绕过权限。
3. 运行新增 workflow 后，把 `marketing-blog / validate` 配成 required check；同时要求实际部署项目的构建/预览检查。检查名称以首次实际 Actions 展示为准。本提交只提供 workflow 文件，不替管理员启用规则。
4. 设置 CODEOWNERS 保护 `.github/`、`.agents/`、`scripts/`、`package*.json`、`AGENTS.md` 和应用代码，并在规则里要求 code owner review。填写真实存在且有权限的维护团队，不能用占位团队。GitHub 普通 Write 权限没有“只能改博客目录”的细粒度限制；路径校验 + 审核是补充，不能把 Skill 当权限沙箱。更强隔离可另用仅提交内容的 GitHub App/独立内容仓库，本期不引入。
5. 由部署负责人核对 main 到生产的实际关联、PR 预览是否自动生成、预览是否公开，以及构建环境所需变量。市场账号无需生产凭据。确认 `algolia:index` 是否需要发布后单独运行；普通发稿 Skill 不写线上索引。
6. 公司管理员批准 Lark CLI 应用和所需只读权限；每位同事自己授权。CLI 仅在其本机读取稿件，不把飞书凭据放 GitHub Actions。
7. 将飞书投稿模板放到团队可访问目录，维护者保留母版，市场同事创建副本。不要默认“链接可访问”就全员有编辑权；按公司权限配置。仓库只存模板结构，不存内部飞书文档地址。

## 两层约束

Skill 约束正常操作：取最新原文、一个 slug、只改文章及配图、预览、draft PR。

校验脚本与 CI 检查真正输出：单篇改动范围、删除/重命名/软链接、字段、日期、Markdown AST 中原始 HTML/不安全链接、图片路径与文件签名、大小预算。代码块内示例可以包含 HTML。此检查不验证事实、版权或视觉质量，也不替代生产运行时 HTML 安全治理。历史文章不批量迁移；本次触及的文章按新规范验证。

## 验收清单

- 用一篇可公开的测试文档和真实封面完成读取 → 下载 → Markdown → 本地检查 → 预览 → draft PR；不合并测试文章。
- 更新同一文档时，目标文章/未合并 PR 被复用，没有生成同标题重复文章；只指定中文时英文未改。
- 飞书更新 revision 后重新读取；缺图、无权限、必填缺失时停止正式提交。
- 故意修改首页、另一篇文章、插入 script/iframe、引用远端图片、写非法日期、删除文件，校验必须拒绝。
- 审核通过后，用正式文章验证真实发布与回退。合并不是上线成功的证据；检查生产博客列表和详情页以及图片。

## 维护

依赖安装使用仓库 lockfile；不要在发稿 PR 里更新依赖。如果现有 lint/build 自身失败，记录日志交维护者单独修复，不能为发文章删规则。网站路径、frontmatter、语言或封面组件改动时，同时更新 Skill、模板与校验器。

参考：[官方 Lark CLI](https://github.com/larksuite/cli)、[Codex Skills](https://learn.chatgpt.com/docs/build-skills)。

## 本次交付验证

- `node --test scripts/validate-marketing-blog.test.mjs`：22 项通过。
- `npm run lint`：通过（包含 analytics consent 校验）。
- `npm run build`：通过；构建期间字体网络读取首次重试后成功。
- Skill frontmatter 校验通过；真实飞书模板创建、最新读取与局部更新回查成功。
- 本地生产构建预览已验证中英文博客列表、图片加载、无图时文字封面，以及 390px 手机布局；独立本地样例确认显式图片模式、缺图回退、旧稿默认样式。
- 尚未验证：一篇市场真实文档含图片的端到端投稿、远端 required check、主分支审核规则、真实部署与回退。模板本身没有真实文章或图片，不把模板读取成功当作端到端发稿成功。
