import { inject, injectable } from 'inversify';
import { ProgressHandler } from '../utils/utils';
import { getCurrentGitRepository, getGitApi } from '../utils/git-utils';
import { ProviderService } from './provider-service';
import { PromptService } from './prompt-service';
import type { Repository } from '../utils/git';
import * as fs from 'fs-extra';
import * as vscode from 'vscode';

@injectable()
export class CommitService {
  #abortController: AbortController | null = null;

  constructor(
    @inject(ProviderService) private providerService: ProviderService,
    @inject(PromptService) private promptService: PromptService
  ) {}

  async generateCommitMessage(arg?: Repository) {
    // If already generating, ask the user what to do (before entering withProgress)
    if (this.#abortController) {
      const result = await vscode.window.showInformationMessage(
        'AI is already generating a commit message.',
        'Retry',
        'Cancel'
      );
      if (result !== 'Retry') {
        return;
      }
      // Abort the previous request
      this.#abortController.abort();
    }

    const abortController = new AbortController();
    this.#abortController = abortController;

    try {
      const startTime = Date.now();
      await ProgressHandler.withProgress('', async (progress) => {
        const repo = this.getRepository(arg);
        if (!repo) {
          throw new Error('Unable to find the git repository');
        }
        const scmInputBox = repo.inputBox;
        if (!scmInputBox) {
          throw new Error('Unable to find the SCM input box');
        }

        progress.report({ message: 'Getting staged changes...' });
        const result = await this.promptService.buildPromptMessages(repo);
        if (!result || !result.messages) {
          throw new Error('No staged changes found. Please stage your changes first.');
        }

        progress.report({ message: 'Generating commit message...' });
        const {
          text: commitMessage,
          usage,
          model
        } = await this.providerService.chatCompletion(result.messages, abortController.signal);
        if (!commitMessage) {
          throw new Error('AI provider returned an empty message.');
        }

        scmInputBox.value = commitMessage.trim();

        const time = Date.now() - startTime;
        const usageText = usage
          ? ` (Input: ${usage.inputTokens ?? 0}, Output: ${usage.outputTokens ?? 0})`
          : '';
        vscode.window.showInformationMessage(
          `Successfully generated commit message using ${model.name} in ${time}ms${usageText}`
        );
      });
    } catch (err) {
      // If this request was aborted (user clicked Retry), swallow the error silently
      if (abortController.signal.aborted) {
        return;
      }
      throw err;
    } finally {
      // Only clear if we are still the current request
      if (this.#abortController === abortController) {
        this.#abortController = null;
      }
    }
  }

  private getRepository(arg?: Repository) {
    const gitApi = getGitApi();
    if (typeof arg === 'object' && arg.rootUri && gitApi) {
      const resourceUri = arg.rootUri;
      const realResourcePath: string = fs.realpathSync(resourceUri!.fsPath);
      for (let i = 0; i < gitApi.repositories.length; i++) {
        const repo = gitApi.repositories[i];
        if (realResourcePath.startsWith(repo.rootUri.fsPath)) {
          return repo;
        }
      }
    }
    return getCurrentGitRepository();
  }
}
