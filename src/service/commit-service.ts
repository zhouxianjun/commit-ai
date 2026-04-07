import { inject, injectable } from 'inversify';
import { ProgressHandler } from '../utils/utils';
import { getCurrentGitRepository, getGitApi } from '../utils/git-utils';
import { ProviderService } from './provider-service';
import { PromptService } from './prompt-service';
import type { Repository } from '../utils/git';
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
      if (!messages) {
        throw new Error('No staged changes found. Please stage your changes first.');
      }
      progress.report({ message: `Generating commit message...` });
      const commitMessage = await this.providerService.chatCompletion(messages);
      if (!commitMessage) {
        throw new Error('AI provider returned an empty message.');
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
