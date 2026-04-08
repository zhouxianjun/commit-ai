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
- **📝 Consistency & Conventions**
  - Strictly follows the Conventional Commits specification.
  - **Gitmoji Support**: Toggle emoji prefixes (✨, 🐛, etc.) on or off.
  - **Multi-language**: Generate messages in 19 different languages.
- **🛠️ Extensibility & Customization**
  - Custom system prompts to fit your team's specific commit style.
  - Contextual awareness: AI can consider text pre-entered in the commit box as extra context to refine its generation.

## 📦 Installation

1. Search for `CommitAI` in the VS Code Extension Marketplace.
2. Click **Install**.
3. Ensure you have Node.js version >= 16 installed locally.

## 🤯 How to Use

1. **Configure Servers**: Search for `commit-ai.servers` in VS Code settings and add your API credentials.
2. **Stage Changes**: Run `git add` for the files you wish to commit.
3. **Provide Context (Optional)**: Type some brief notes in the Source Control message box if you want to guide the AI.
4. **Generate**: Click the `$(sparkle)` (or CommitAI) icon button in the Source Control title bar.
5. **Commit**: Review the generated message and click the checkmark to commit.

## ⚙️ Key Configuration Options

| Configuration                  |  Type   |  Default  | Description                                                               |
| :----------------------------- | :-----: | :-------: | :------------------------------------------------------------------------ |
| `commit-ai.servers`            |  Array  |   `[]`    | List of AI server configurations including type, baseURL, and apiKey.     |
| `commit-ai.AI_COMMIT_LANGUAGE` | String  | `English` | The target language for generated messages.                               |
| `commit-ai.USE_GITMOJI`        | Boolean |  `true`   | Whether to include Gitmoji (e.g., ✨, 💡).                                |
| `commit-ai.TOKEN_COUNT_MODE`   |  Enum   |  `fast`   | `fast` uses character estimation; `accurate` uses tiktoken for precision. |
| `commit-ai.SHOW_TOKEN_COUNT`   | Boolean |  `true`   | Toggle the visibility of token usage in the status bar.                   |

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
