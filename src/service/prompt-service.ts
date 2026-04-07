import { inject, injectable } from 'inversify';
import { ConfigKeys, ConfigService } from './config-service';
import type { ChatMessage } from '../providers';
import path from 'path';
import * as fs from 'fs-extra';
import type { Repository } from '../git';
import { getDiffStaged } from '../git-utils';

@injectable()
export class PromptService {
  constructor(@inject(ConfigService) private configService: ConfigService) {}

  async buildPromptMessages(repo: Repository): Promise<ChatMessage[]> {
    const { diff, isEmpty } = await getDiffStaged(repo);
    if (isEmpty) {
      return;
    }
    const additionalContext = repo.inputBox.value.trim();
    const initMessages = this.getSystemPrompt();
    const messages: ChatMessage[] = [...initMessages];

    if (additionalContext) {
      messages.push({
        role: 'user',
        content: `Additional context for the changes:\n${additionalContext}`
      });
    }

    messages.push({
      role: 'user',
      content: diff
    });

    return messages;
  }

  private getPromptTemplate() {
    const systemPrompt = this.configService.getConfig<string>(ConfigKeys.SYSTEM_PROMPT);
    if (systemPrompt) {
      return systemPrompt;
    }
    const language = this.configService.getConfig<string>(ConfigKeys.AI_COMMIT_LANGUAGE, 'English');
    const useGitmoji = this.configService.getConfig<boolean>(ConfigKeys.USE_GITMOJI, true);
    const template = loadPromptTemplate(useGitmoji ? 'with_gitmoji.md' : 'without_gitmoji.md');
    return template.replace(/\${language}/g, language);
  }
  private getSystemPrompt(): ChatMessage[] {
    return [
      {
        role: 'system',
        content: this.getPromptTemplate()
      }
    ];
  }
}

const PROMPT_DIR = path.join(__dirname, '../../', 'prompt');

function loadPromptTemplate(fileName: string): string {
  const filePath = path.join(PROMPT_DIR, fileName);
  return fs.readFileSync(filePath, 'utf-8');
}
