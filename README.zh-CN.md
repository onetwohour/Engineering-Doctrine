# Engineering Doctrine

[English](README.md) · **简体中文** · [한국어](README.ko.md)

**Engineering Doctrine** 是一个面向 Claude Code 的工程工作规范插件。它会引导 Claude Code 在修改前确认真正的原因、ownership、invariant、lifecycle 和 boundary，只修改必要范围，用证据验证实际行为，并在宣布完成前重新审查全部变更。

## 安装

```bash
claude plugin marketplace add onetwohour/Engineering-Doctrine
claude plugin install engineering-doctrine@onetwohour
```

安装后，启动一个新的 Claude Code 会话即可。

## 使用

不需要额外命令。像平常一样直接提出任务即可。

```text
找出登录后会话偶发失效的原因并修复。
```

```text
分析这个模块的 ownership 结构，并在必要时进行重构。
```

```text
复现这个 bug，修复它，并添加回归测试。
```

插件会根据任务类型和风险只应用必要的规则。小改动会保持轻量；涉及架构、状态、安全、数据、并发或 migration 的复杂工作会进行更深入的审查。

## 使用后有什么不同？

Claude Code 会更一致地做到：

- 修复真正的原因，而不是只处理症状
- 在实现前确认 ownership、state 和 invariant
- 避免不必要的 abstraction 和 architecture ceremony
- 安全、精确地修改文件
- 从模型和 failure space 推导测试
- 不把未实际执行的工作声称为已经验证
- 保留用户数据和已有工作
- 完成前再次审查 diff 和 evidence

## 完整规范

完整的 Engineering Doctrine 位于 [doctrine/ENGINEERING_DOCTRINE.md](doctrine/ENGINEERING_DOCTRINE.md)。

## 本地使用

如果直接 checkout 了此仓库：

```bash
claude --plugin-dir ./plugin
```

## 许可证

[Apache-2.0](LICENSE)
