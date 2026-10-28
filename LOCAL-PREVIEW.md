# 本地官网预览

固定地址：http://127.0.0.1:3000/zh

也可双击 `../打开密瓜官网.command`。服务由当前用户的 macOS LaunchAgent 管理，登录后自动启动，意外退出后自动恢复，不依赖 Codex 会话。仅监听本机，不对局域网或公网开放。电脑关机或休眠期间不能访问，唤醒后可继续使用。

- 服务：`ai.dynamia.website.local`
- 配置：`~/Library/LaunchAgents/ai.dynamia.website.local.plist`
- 日志：`.qa/local-service.log` 与 `.qa/local-service-error.log`
- 停用：`launchctl bootout gui/$(id -u)/ai.dynamia.website.local`
- 恢复：双击上述启动文件。
- 更新代码后：先 `npm run build`，成功后 `launchctl kickstart -k gui/$(id -u)/ai.dynamia.website.local`。

当前本地站点使用已迁移的完整 Demo；生产构建位于 `.next`，不要删除该目录。若需手动运行开发服务器，请先停用此服务或使用其他端口。
