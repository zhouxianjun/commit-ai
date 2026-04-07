# AGENTS.md — CommitAI VS Code Extension

This file provides guidance for agentic coding agents working in this repository.

## Project Overview

**CommitAI** is a VS Code extension that generates AI-powered conventional commit messages from staged git diffs. It features a robust, refactored architecture with multi-server failover, accurate token monitoring, and multi-provider support (OpenAI, Azure, Gemini, DeepSeek).

## Build / Lint / Test Commands

| Command            | Purpose                           |
| ------------------ | --------------------------------- |
| `pnpm install`     | Install dependencies              |
| `pnpm run build`   | Production build via tsdown       |
| `pnpm run compile` | Dev build via tsdown              |
| `pnpm run watch`   | Watch mode for development        |
| `pnpm run lint`    | ESLint on `src/` TypeScript files |
| `pnpm run package` | Create `.vsix` package (vsce)     |

## Architecture

The project uses **InversifyJS** for dependency injection.

```
src/
├── extension.ts            # Entry point: bootstrap inversify container & activate
├── consts.ts               # Core constants (command IDs, config prefix)
├── utils/                  # Shared helper functions
│   ├── utils.ts            # Shared helper functions
│   ├── git-utils.ts        # Git operations via simple-git
│   ├── tokens.ts           # Token calculation utilities
│   └── git.d.ts            # VS Code Git extension types
├── providers/              # LLM Provider implementations
│   ├── index.ts            # factory to create providers
│   ├── types.ts            # Provider interfaces (AIProvider)
│   ├── openai-provider.ts  # OpenAI compatible (OpenAI, Azure, DeepSeek)
│   └── gemini-provider.ts  # Google Gemini provider
└── service/                # Business logic services (Injectable)
    ├── command-service.ts     # VS Code command registration
    ├── commit-service.ts      # Core logic for diff -> commit msg
    ├── config-service.ts      # Settings management (commit-ai.*)
    ├── llm-server-service.ts  # Failover orchestrator between servers
    ├── prompt-service.ts      # Prompt template loading
    ├── provider-service.ts    # Model context & specific provider dispatch
    ├── status-bar-service.ts  # UI: Token usage display in status bar
    └── token-service.ts       # Token calculation (tiktoken/estimation)
```

## Key Patterns

### 1. Dependency Injection (DI)

All services are marked with `@injectable()` and registered in the Inversify container in `src/extension.ts`. Use `@inject(Service)` in constructors.

### 2. Configuration Management

`ConfigService` reads settings with the `commit-ai.` prefix. Use `ConfigService.getConfig(ConfigKeys.XXX)` to access values.

### 3. AI Failover

The `LLMServerService` iterates through configured servers in `commit-ai.servers`. If one fails, it automatically retries with the next one until success or exhaustion.

### 4. Precision Token Counting

`TokenService` supports both `fast` (estimation) and `accurate` (tiktoken) modes based on user settings. This state is shared with `StatusBarService` for UI display.

## Code Style

### Formatting (oxfmt)

Configured in `.oxfmtrc.json`:

- **88** character line width
- **Semicolons required**
- **Single quotes** for strings
- **No trailing commas**

### Linting (ESLint)

Strict rules for semicolons, curly braces, and equality checks (`===`).

## Adding a New Provider

1. Create `src/providers/xxx-provider.ts` implementing `AIProvider`.
2. Register the provider type in `src/providers/index.ts`.
3. Add the provider type to the `enum` in `package.json` configurations.

---

**Note**: This project was originally based on the concepts of [Sitoi/ai-commit](https://github.com/Sitoi/ai-commit) but has been fundamentally refactored into its current architecture.
