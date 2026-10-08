# Engineering Doctrine

[English](README.md) · **简体中文** · [한국어](README.ko.md)

**Engineering Doctrine** 是一个用于 Claude Code 的工程规范插件。它帮助 Claude 在修改软件前理解问题根因、职责和不变量，尊重现有架构，精确控制变更范围，并依据实际验证结果审查工作。

## 安装

```bash
claude plugin marketplace add onetwohour/claude-plugins
claude plugin install engineering-doctrine@onetwohour
```

安装后，重新启动 Claude Code 会话即可。

## 使用

无需额外命令，像平常一样提出任务：

```text
找出登录后会话偶发失效的原因并修复。
```

```text
分析这个模块的职责归属，并在必要时进行重构。
```

```text
复现这个 bug，修复它，并添加回归测试。
```

插件根据任务选择相关规范。局部的小改动保持轻量；涉及架构、状态、安全、数据、并发或迁移的变更则进行更深入的审查。

## 核心原则

- **先理解，再修改：** 确认根因、职责、状态与失败路径。
- **尊重现有架构：** 优先复用已有职责归属，避免重复的事实来源。
- **精准变更：** 将修改限制在有充分依据的范围内，保护现有工作和数据。
- **验证实际行为：** 执行相关检查，考虑失败场景，区分事实与推测。
- **完成前复核：** 检查最终差异和验证依据，准确报告已证实的结果。

## 完整规范

完整规则见 [Engineering Doctrine](doctrine/ENGINEERING_DOCTRINE.md)。

## 本地使用

也可以直接从克隆的仓库运行插件：

```bash
git clone https://github.com/onetwohour/Engineering-Doctrine.git
claude --plugin-dir ./Engineering-Doctrine/plugin
```

`--plugin-dir` 仅对当前会话生效。

## 许可证

[Apache-2.0](LICENSE)
