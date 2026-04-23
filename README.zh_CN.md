<a name="readme-top"></a>

<div align="center">

<img height="120" src="https://github.com/zhouxianjun/commit-ai/blob/main/images/logo.png?raw=true">

<h1>CommitAI</h1>

基于 AI 的 VS Code 自动化提交助手。支持多引擎、高可靠的 Conventional Commit 消息生成。

[English](./README.md) · **简体中文** · [报告问题](https://github.com/zhouxianjun/commit-ai/issues) · [请求功能](https://github.com/zhouxianjun/commit-ai/issues)

<!-- SHIELD GROUP -->

[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][vscode-marketplace-shield]][vscode-marketplace-link]
[![][total-installs-shield]][total-installs-link]
[![][avarage-rating-shield]][avarage-rating-link]
[![][github-license-shield]][github-license-link]

![](https://github.com/zhouxianjun/commit-ai/blob/main/aicommit.gif?raw=true)

</div>

## 📖 项目简介

**CommitAI** 是一款专为 VS Code 打造的 AI 辅助提交工具。它能够智能扫描你的 Git 暂存区 (Staged) 变化，结合代码上下文，自动生成符合 Conventional Commits 规范的提交信息。

本项目在底层架构上参考了 [ai-commit](https://github.com/Sitoi/ai-commit) 的实现思路，但内部逻辑经过了完全重构，显著增强了稳定性，并引入了多项高级特性。

## ✨ 核心特性

- **🚀 自动切换与故障转移 (Failover)**
  - 支持配置多个 AI 服务器（OpenAI, Azure, Gemini 等）。
  - 当首选服务器超时或异常时，自动按顺序尝试备用服务器，确保生成过程不中断。
- **⚖️ 精确的 Token 监控**
  - 集成 `tiktoken` 提供像素级的 Token 计算精度。
  - 并在 VS Code 状态栏实时展示预估消耗，防止超出模型上下文限制。
- **🤖 广泛的模型兼容性**
  - **OpenAI**: 支持 GPT-4o, GPT-4o-mini 以及 o1/o3 推理模型（支持设置推理力度）。
  - **Azure OpenAI**: 完美支持企业级 Azure 接口。
  - **Google Gemini**: 支持最新的 Gemini 2.0 Flash/Pro。
  - **DeepSeek / 其他**: 只要兼容 OpenAI 接口标准的模型均可直接接入。
- **🖥️ 可视化配置面板**
  - 提供直观的 UI 界面，轻松管理多组 AI 服务商与模型。
  - 支持一键测试连接、拖拽调整优先级、快速开启/禁用模型。
- **📊 详尽的 Token 消耗统计**
  - 实时记录并汇总各服务商的 Token 消耗详情，支持按周期查看历史数据。
- **📝 提交规范一致性**
  - 默认输出风格严谨的 Conventional Commits。
  - **Gitmoji 支持**: 自由开启或关闭表情符号。
  - **多语言输出**: 支持中文、英文、日文、韩文等 19 种语言。
- **🛠️ 极致的自定义能力**
  - 支持自定义系统 Prompt，可针对项目需求定制特殊的提交风格。
  - 支持在生成前从提交框读取额外上下文信息，引导 AI 生成更精准的描述。

## 📦 安装方法

1. 在 VS Code 扩展商店搜索 `CommitAI`。
2. 点击安装。
3. 确保本地安装了 Node.js >= 16。

## 🤯 使用流程

1. **配置服务**: 在命令面板 (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows) 中搜索并执行 `CommitAI: AI Server Settings` 进入可视化配置页面。也可以在 VS Code 设置中找到 `commit-ai.servers` 点击提示链接进入。
2. **暂存更改**: 在 Git 面板中将修改的文件 `git add` 到暂存区。
3. **输入引导 (可选)**: 如果有特殊说明，可以在提交框先写一段话。
4. **一键生成**: 点击提交框右上角的 `$(sparkle)`（或 CommitAI）图标。
5. **确认提交**: 确认生成的描述无误后，点击勾选提交。

## ⚙️ 详细配置项

| 配置名称                       |  类型   |  默认值   | 描述                                                       |
| :----------------------------- | :-----: | :-------: | :--------------------------------------------------------- |
| `commit-ai.servers`            |  Array  |   `[]`    | 配置多组 AI 引擎，支持 OpenAI, Azure, Gemini 等。          |
| `commit-ai.AI_COMMIT_LANGUAGE` | String  | `English` | 设置提交信息的语言（已预设 19 种选项）。                   |
| `commit-ai.USE_GITMOJI`        | Boolean |  `true`   | 是否在消息前缀添加 Gitmoji（如 ✨, 🐛）。                  |
| `commit-ai.TOKEN_COUNT_MODE`   |  Enum   |  `fast`   | `fast` 为快速估算，`accurate` 使用 tiktoken 进行精确计算。 |
| `commit-ai.SHOW_TOKEN_COUNT`   | Boolean |  `true`   | 是否在底部状态栏显示当前暂存内容的 Token 预估。            |

## 键盘快捷键 (推荐自定义)

可以在 VS Code 快捷键设置中为命令 `extension.commit-ai` 绑定你习惯的操作。

## 🔗 链接与反馈

- **特别鸣谢**: 本项目参考了 [Sitoi/ai-commit](https://github.com/Sitoi/ai-commit) 的核心概念。
- **License**: [MIT](./LICENSE)

---

<!-- LINK GROUP -->

[github-contributors-link]: https://github.com/zhouxianjun/commit-ai/graphs/contributors
[github-contributors-shield]: https://img.shields.io/github/contributors/zhouxianjun/commit-ai?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]: https://github.com/zhouxianjun/commit-ai/network/members
[github-forks-shield]: https://img.shields.io/github/forks/zhouxianjun/commit-ai?color=8ae8ff&labelColor=black&style=flat-square
[github-issues-link]: https://github.com/zhouxianjun/commit-ai/issues
[github-issues-shield]: https://img.shields.io/github/issues/zhouxianjun/commit-ai?color=ff80eb&labelColor=black&style=flat-square
[github-license-link]: https://github.com/zhouxianjun/commit-ai/blob/main/LICENSE
[github-license-shield]: https://img.shields.io/github/license/zhouxianjun/commit-ai?color=white&labelColor=black&style=flat-square
[github-stars-link]: https://github.com/zhouxianjun/commit-ai/network/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/zhouxianjun/commit-ai?color=ffcb47&labelColor=black&style=flat-square
[vscode-marketplace-link]: https://marketplace.visualstudio.com/items?itemName=zhouxianjun.commit-ai
[vscode-marketplace-shield]: https://img.shields.io/vscode-marketplace/v/zhouxianjun.commit-ai.svg?label=vscode%20marketplace&color=blue&labelColor=black&style=flat-square
[total-installs-link]: https://marketplace.visualstudio.com/items?itemName=zhouxianjun.commit-ai
[total-installs-shield]: https://img.shields.io/vscode-marketplace/d/zhouxianjun.commit-ai.svg?&labelColor=black&style=flat-square
[avarage-rating-link]: https://marketplace.visualstudio.com/items?itemName=zhouxianjun.commit-ai
[avarage-rating-shield]: https://img.shields.io/vscode-marketplace/r/zhouxianjun.commit-ai.svg?color=green&labelColor=black&style=flat-square
