import { inject, injectable } from 'inversify';
import { ProgressHandler } from '../utils';
import { getCurrentGitRepository, getGitApi } from '../git-utils';
import { ProviderService } from './provider-service';
import { PromptService } from './prompt-service';
import type { Repository } from '../git';
import * as fs from 'fs-extra';

@injectable()
export class CommitService {
  constructor(
    @inject(ProviderService) private providerService: ProviderService,
    @inject(PromptService) private promptService: PromptService
  ) {}

  generateCommitMessage(arg?: Repository) {
    return ProgressHandler.withProgress('', async (progress) => {
      const repo = this.getRepository(arg);
      if (!repo) {
        throw new Error('Unable to find the git repository');
      }
      const scmInputBox = repo.inputBox;
      if (!scmInputBox) {
        throw new Error('Unable to find the SCM input box');
      }
      progress.report({ message: 'Getting staged changes...' });
      const messages = await this.promptService.buildPromptMessages(repo);
      progress.report({ message: `Generating commit message...` });
      const commitMessage = await this.providerService.chatCompletion(messages);
      if (!commitMessage) {
        throw new Error('Failed to generate commit message');
      }

      scmInputBox.value = commitMessage;
    });
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
