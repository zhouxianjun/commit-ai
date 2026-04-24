<a name="readme-top"></a>

<div align="center">

<img height="120" src="https://github.com/zhouxianjun/commit-ai/blob/main/images/logo.png?raw=true">

<h1>CommitAI</h1>

An AI-powered VS Code extension to generate high-reliability, multi-engine Conventional Commit messages.

**English** · [简体中文](./README.zh_CN.md) · [Report Bug](https://github.com/zhouxianjun/commit-ai/issues) · [Request Feature](https://github.com/zhouxianjun/commit-ai/issues)

<!-- SHIELD GROUP -->

[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][open-vsx-marketplace-shield]][open-vsx-marketplace-link]
[![][total-installs-shield]][total-installs-link]
[![][avarage-rating-shield]][avarage-rating-link]
[![][github-license-shield]][github-license-link]

![](https://github.com/zhouxianjun/commit-ai/blob/main/aicommit.gif?raw=true)

</div>

## 📖 Introduction

**CommitAI** is an AI assistant for VS Code designed to simplify your Git workflow. It intelligently scans your staged changes and generates precise, descriptive commit messages adhering to the Conventional Commits specification.

This project is inspired by the core ideas of [ai-commit](https://github.com/Sitoi/ai-commit). While referring to its implementation, the internal logic has been completely refactored to significantly improve reliability and introduce advanced features like multi-server failover and real-time token tracking.

## ✨ Core Features

- **🚀 Automatic Failover (High Availability)**
  - Configure multiple AI servers (OpenAI, Azure, Gemini, etc.).
  - If the primary server times out or fails, the extension automatically retries backup servers in order, ensuring a seamless generation experience.
- **⚖️ Precise Token Monitoring**
  - Integrated `tiktoken` for pixel-perfect token calculation.
  - Real-time token estimation displayed in the VS Code status bar to prevent exceeding model context windows.
- **🤖 Robust Model Support**
  - **OpenAI**: Fully supports GPT-4o, GPT-4o-mini, and o1/o3 reasoning models with configurable reasoning effort.
  - **Azure OpenAI**: Native support for enterprise-grade Azure endpoints.
  - **Google Gemini**: Support for the latest Gemini 2.0 Flash/Pro.
  - **DeepSeek & More**: Any provider compatible with the OpenAI API standard can be integrated.
- **🖥️ Graphical Configuration Dashboard**
  - Intuitive UI for managing AI providers and models.
  - Test connections and reorder servers with ease.
- **📊 Detailed Token Usage Stats**
  - Track your consumption over time with detailed logs and statistics per provider.
- **📝 Consistency & Conventions**
  - Strictly follows the Conventional Commits specification.
  - **Gitmoji Support**: Toggle emoji prefixes (✨, 🐛, etc.) on or off.
  - **Multi-language**: Generate messages in 19 different languages.
- **🛠️ Extensibility & Customization**
  - Custom system prompts to fit your team's specific commit style.
  - Contextual awareness: AI can consider text pre-entered in the commit box as extra context to refine its generation.

## 📦 Installation

1. Search for `CommitAI` in the VS Code or OpenVSX Extension Marketplace.
2. Click **Install**.
3. Ensure you have Node.js version >= 16 installed locally.

## 🤯 How to Use

1. **Configure Servers**: Open the Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows) and run `CommitAI: AI Server Settings`. Alternatively, search for `commit-ai.servers` in VS Code settings and click the configuration link.
2. **Stage Changes**: Run `git add` for the files you wish to commit.
3. **Provide Context (Optional)**: Type some brief notes in the Source Control message box if you want to guide the AI.
4. **Generate**: Click the <img height="16" src="https://github.com/zhouxianjun/commit-ai/blob/main/images/logo.png?raw=true"> icon button in the Source Control title bar.
5. **Commit**: Review the generated message and click the checkmark to commit.

## ⚙️ Configuration Details

### Core Settings

| Configuration                  |  Type   |  Default  | Description                                                           |
| :----------------------------- | :-----: | :-------: | :-------------------------------------------------------------------- |
| `commit-ai.servers`            |  Array  |   `[]`    | AI engine configurations, supporting OpenAI, Azure, Gemini, etc.      |
| `commit-ai.AI_COMMIT_LANGUAGE` | String  | `English` | Target language for commit messages (19 options available).           |
| `commit-ai.USE_GITMOJI`        | Boolean |  `true`   | Whether to include Gitmoji prefixes (e.g., ✨, 🐛).                   |
| `commit-ai.TOKEN_COUNT_MODE`   |  Enum   |  `fast`   | `fast` for estimation; `accurate` uses tiktoken for precise counting. |
| `commit-ai.SHOW_TOKEN_COUNT`   | Boolean |  `true`   | Toggle real-time token tracking in the status bar.                    |

### AI Server Types (`commit-ai.servers`)

| Type (`type`) | Required Fields                             | Suggested `baseURL`              | Use Case                                                                 |
| :------------ | :------------------------------------------ | :------------------------------- | :----------------------------------------------------------------------- |
| **`openai`**  | `apiKey`, `models`                          | `https://api.openai.com/v1`      | Standard OpenAI, DeepSeek, OpenRouter, or any OpenAI-compatible service. |
| **`gemini`**  | `apiKey`, `models`                          | (Optional)                       | Official Google Gemini service.                                          |
| **`azure`**   | `apiKey`, `baseURL`, `apiVersion`, `models` | `https://{res}.openai.azure.com` | Microsoft Azure OpenAI service.                                          |

### Model Properties (`models` array)

| Property          | Type      | Default | Description                                                                                                                  |
| :---------------- | :-------- | :------ | :--------------------------------------------------------------------------------------------------------------------------- |
| `name`            | `string`  | -       | **Model ID** (e.g., `gpt-4o`, `deepseek-chat`). The plugin auto-detects token limits based on this ID.                       |
| `enabled`         | `boolean` | `true`  | Whether to enable this model.                                                                                                |
| `temperature`     | `number`  | `0.7`   | Sampling temperature (0-2). Higher is more random, lower is more focused.                                                    |
| `maxTokens`       | `number`  | `0`     | Max output tokens (0 = no limit).                                                                                            |
| `maxInputTokens`  | `number`  | `0`     | Max input context window (0 = auto-detect based on model name).                                                              |
| `reasoningEffort` | `string`  | `none`  | **Reasoning Effort**: Applied to OpenAI o1/o3 and mapped to "Thinking/Think" parameters for other models (e.g., Gemini 2.0). |
| `options`         | `object`  | `{}`    | Key-value pairs passed directly to the underlying SDK.                                                                       |

---

## 🛠️ Configuration Workflow

For the best experience, we recommend using the **Visual Settings Dashboard**:

<div style="display: flex; gap: 10px; align-items: center">
  <img src="https://github.com/zhouxianjun/commit-ai/blob/main/images/provider-list.png?raw=true" alt="Providers list" style="width: 33%;">
  <img src="https://github.com/zhouxianjun/commit-ai/blob/main/images/edit-provider.png?raw=true" alt="Edit provider" style="width: 33%;">
  <img src="https://github.com/zhouxianjun/commit-ai/blob/main/images/add-model.png?raw=true" alt="Add model" style="width: 33%;">
</div>

1.  **Launch Dashboard**:
    - Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).
    - Search for and select `CommitAI: AI Server Settings`.
2.  **Manage Servers**:
    - Click **"Add Server"** to create a new configuration.
    - Enter your API Key and adjust the Base URL if necessary.
    - 💡 **Pro Tip**: Add multiple servers to enable **Automatic Failover** — if one fails, the next in line will take over.
3.  **Refine Models**:
    - 💡 **Important**: You **must click the "Test" button** at the bottom of the server card before clicking "Add Model". This verifies the connection and fetches the list of available models.
    - Click **"Add Model"** within a server card and select a model from the list (e.g., `gpt-4o-mini`).
    - Customize temperature or token limits per model.
4.  **Test & Reorder**:
    - Click **"Test"** to verify the connection.
    - Drag the icon on the left of server cards to **adjust priority**.
5.  **Monitor Usage**:
    - View real-time **Token Usage Statistics** at the bottom of the dashboard to keep track of your costs.

## Keyboard Shortcuts

We recommend binding a custom shortcut to the `extension.commit-ai` command in your VS Code Keyboard Shortcuts settings.

## 🔗 Credits & Feedback

- **Special Thanks**: This project refers to the core concepts of [Sitoi/ai-commit](https://github.com/Sitoi/ai-commit).
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
[open-vsx-marketplace-link]: https://open-vsx.org/extension/alone/commit-ai
[open-vsx-marketplace-shield]: https://img.shields.io/open-vsx/v/alone/commit-ai.svg?label=open-vsx&color=blue&labelColor=black&style=flat-square
[total-installs-link]: https://open-vsx.org/extension/alone/commit-ai
[total-installs-shield]: https://img.shields.io/open-vsx/dt/alone/commit-ai?&labelColor=black&style=flat-square
[avarage-rating-link]: https://open-vsx.org/extension/alone/commit-ai
[avarage-rating-shield]: https://img.shields.io/open-vsx/rating/alone/commit-ai?color=green&labelColor=black&style=flat-square
