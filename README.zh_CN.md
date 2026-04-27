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
  - **Prompt 模板选择**: 内置多种 Prompt 模板（带/不带 Gitmoji，带/不带 Body 等），支持一键切换，也支持完全自定义。
  - **多语言输出**: 支持中文、英文、日文、韩文等 19 种语言。
- **🛠️ 极致的自定义能力**
  - 支持自定义系统 Prompt，可针对项目需求定制特殊的提交风格。
  - **文件过滤**: 支持通过配置 `excludeFiles` 忽略 `*.lock` 等无关紧要的文件。
  - 支持在生成前从提交框读取额外上下文信息，引导 AI 生成更精准的描述。

## 📦 安装方法

1. 在 VS Code 或 OpenVSX 扩展商店搜索 `CommitAI`。
2. 点击安装。
3. 确保本地安装了 Node.js >= 16。

## 🤯 使用流程

1. **配置服务**: 在命令面板 (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows) 中搜索并执行 `CommitAI: AI Server Settings` 进入可视化配置页面。也可以在 VS Code 设置中找到 `commit-ai.servers` 点击提示链接进入。
2. **暂存更改**: 在 Git 面板中将修改的文件 `git add` 到暂存区。
3. **输入引导 (可选)**: 如果有特殊说明，可以在提交框先写一段话。
4. **一键生成**: 点击提交框右上角的 <img height="16" src="https://github.com/zhouxianjun/commit-ai/blob/main/images/logo.png?raw=true"> 图标。
5. **确认提交**: 确认生成的描述无误后，点击勾选提交。

## ⚙️ 详细配置项

### 核心设置

| 配置名称                       |  类型   |  默认值   | 描述                                                       |
| :----------------------------- | :-----: | :-------: | :--------------------------------------------------------- |
| `commit-ai.servers`            |  Array  |   `[]`    | 配置多组 AI 引擎，支持 OpenAI, Azure, Gemini 等。          |
| `commit-ai.AI_COMMIT_LANGUAGE` | String  | `English` | 设置提交信息的语言（已预设 19 种选项）。                   |
| `commit-ai.PROMPT_TEMPLATE`      |  String | `with_gitmoji.md` | 选择 Prompt 模板（详见设置面板中的选项）。                 |
| `commit-ai.AI_COMMIT_SYSTEM_PROMPT` | String |   `""`    | 自定义 System Prompt（仅在 `PROMPT_TEMPLATE` 为 `custom` 时有效）。 |
| `commit-ai.TOKEN_COUNT_MODE`   |  Enum   |  `fast`   | `fast` 为快速估算，`accurate` 使用 tiktoken 进行精确计算。 |
| `commit-ai.SHOW_TOKEN_COUNT`   | Boolean |  `true`   | 是否在底部状态栏显示当前暂存内容的 Token 预估。            |
| `commit-ai.EXCLUDE_FILES`      |  Array  |  `[...]`  | 忽略不需要生成提交信息的文件（支持 `*.lock`, `*.min.js` 等模式）。 |

### AI 服务商类型 (`commit-ai.servers`)

| 类型 (`type`) | 必需字段                                    | 建议 `baseURL`                   | 适用场景                                                                  |
| :------------ | :------------------------------------------ | :------------------------------- | :------------------------------------------------------------------------ |
| **`openai`**  | `apiKey`, `models`                          | `https://api.openai.com/v1`      | 标准 OpenAI、DeepSeek、OpenRouter 或任何兼容 OpenAI 接口的本地/云端服务。 |
| **`gemini`**  | `apiKey`, `models`                          | (可选)                           | Google Gemini 官方服务。                                                  |
| **`azure`**   | `apiKey`, `baseURL`, `apiVersion`, `models` | `https://{res}.openai.azure.com` | 微软 Azure OpenAI 服务。                                                  |

### 模型属性配置 (`models` 数组)

| 属性名            | 类型      | 默认值 | 说明                                                                                            |
| :---------------- | :-------- | :----- | :---------------------------------------------------------------------------------------------- |
| `name`            | `string`  | -      | **模型 ID**。如 `gpt-4o`, `deepseek-chat`。插件会根据此 ID 自动匹配 Token 限制。                |
| `enabled`         | `boolean` | `true` | 是否启用该模型。                                                                                |
| `temperature`     | `number`  | `0.7`  | 采样温度 (0-2)。越大越随机，越小越严谨。                                                        |
| `maxTokens`       | `number`  | `0`    | 最大输出 Token 数 (0 为不限制)。                                                                |
| `maxInputTokens`  | `number`  | `0`    | 最大输入上下文限制 (0 为根据模型名自动识别)。                                                   |
| `reasoningEffort` | `string`  | `none` | **推理力度**：适用于 OpenAI o1/o3 及其映射到其他模型（如 Gemini 2.0）的 "Thinking/Think" 参数。 |
| `options`         | `object`  | `{}`   | 扩展参数，透传给底层 SDK。                                                                      |

---

## 🛠️ 配置流程说明

为了获得最佳体验，推荐使用**可视化配置面板**：

<div style="display: flex; gap: 10px; align-items: center">
  <img src="https://github.com/zhouxianjun/commit-ai/blob/main/images/provider-list.png?raw=true" alt="Providers list" style="width: 33%;">
  <img src="https://github.com/zhouxianjun/commit-ai/blob/main/images/edit-provider.png?raw=true" alt="Edit provider" style="width: 33%;">
  <img src="https://github.com/zhouxianjun/commit-ai/blob/main/images/add-model.png?raw=true" alt="Add model" style="width: 33%;">
</div>

1.  **启动面板**:
    - 使用快捷键 `Cmd+Shift+P` / `Ctrl+Shift+P` 调出命令面板。
    - 输入并选择 `CommitAI: AI Server Settings`。
2.  **管理服务商**:
    - 点击 **"Add Server"** 新增配置。
    - 输入 API Key 并根据需要调整 Base URL。
    - 💡 **提示**: 你可以添加多个服务商，插件会自动实现**故障转移 (Failover)** —— 当排名靠前的服务商不可用时，自动切换到下一个。
3.  **精细化模型**:
    - 💡 **重要**: 在点击 "Add Model" 之前，**必须先点击服务商卡片底部的 "Test" 按钮**。这会验证连接并获取该服务商支持的模型列表。
    - 在服务商卡片中点击 **"Add Model"**，从下拉列表中选择模型（如 `gpt-4o-mini`）。
    - 你可以为每个模型设置独立的 Temperature 或 Token 限制。
4.  **测试与排序**:
    - 点击 **"Test"** 按钮验证配置是否正确。
    - 拖动服务商卡片左侧的图标可**调整优先级**。
5.  **统计查看**:
    - 在面板下方可以实时查看各服务商的 **Token 消耗统计**，帮助你控制成本。

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
