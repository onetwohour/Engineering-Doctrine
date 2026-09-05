# Engineering Doctrine

[English](README.md) · **简体中文** · [한국어](README.ko.md)

**Engineering Doctrine** 是一个面向 Claude Code 的工程工作规范插件。它会引导 Claude Code 在修改前确认真正的原因、ownership、invariant、lifecycle 和 boundary，只修改必要范围，用证据验证实际行为，并在宣布完成前重新审查全部变更。

## 安装

```bash
claude plugin marketplace add onetwohour/claude-plugins
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

如果不安装，直接从克隆的仓库运行：

```bash
git clone https://github.com/onetwohour/Engineering-Doctrine.git
claude --plugin-dir ./Engineering-Doctrine/plugin
```

`--plugin-dir` 只对当前会话生效，因此每次启动 Claude Code 都需要带上它。

## 如果 doctrine 技能没有被使用

Claude Code 会把每个技能的名称和描述放进模型上下文，但这个列表的预算约为模型上下文窗口的 1%。安装的技能很多时，Claude Code 会从调用最少的技能开始缩短或删除描述。doctrine 技能只由 Claude 自动调用，因此最先失去描述；没有描述，Claude 就无法判断何时加载它们。

用 `/context`（Skills 行显示模型实际收到的列表大小）和 `/doctor`（列表成本及其最大贡献者）检查。如果超出预算，在 `settings.json` 中设置 `"skillListingBudgetFraction": 0.02` 提高预算，或在 `skillOverrides` 中把不需要的技能设为 `"name-only"`。

上下文压缩后，Claude Code 会重新附加已调用的技能：每个技能保留前 5,000 token，总预算 25,000 token，从最近调用的开始填充。每个 doctrine 技能都在单技能上限内，但 12 个加起来约 26,800 token，因此在加载了大部分技能的会话中，最早调用的可能被丢弃。重新调用即可恢复，也可以按名称强制加载，例如 `/engineering-doctrine:mutation-safety`。

## 许可证

[Apache-2.0](LICENSE)
