import { inject, injectable } from 'inversify';
import { ConfigKeys, ConfigService } from './config-service';
import type { ChatMessage } from '../providers';
import path from 'path';
import * as fs from 'fs-extra';
import type { Repository } from '../utils/git';
import { getDiffStaged } from '../utils/git-utils';

@injectable()
export class PromptService {
  constructor(@inject(ConfigService) private configService: ConfigService) {}

  async buildPromptMessages(repo: Repository): Promise<ChatMessage[]> {
    const excludeFiles = this.configService.getConfig<string[]>(ConfigKeys.EXCLUDE_FILES, []);

    const { diff, isEmpty } = await getDiffStaged(repo, {
      excludeFiles
    });
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

  private doGetTemplate() {
    const template = this.configService.getConfig<string>(
      ConfigKeys.PROMPT_TEMPLATE,
      'with_gitmoji.md'
    );
    if (template === 'custom') {
      return this.configService.getConfig<string>(ConfigKeys.SYSTEM_PROMPT, '');
    }
    return loadPromptTemplate(template);
  }
  private getPromptTemplate() {
    const promptTemplate = this.doGetTemplate();
    const language = this.configService.getConfig<string>(ConfigKeys.AI_COMMIT_LANGUAGE, 'English');
    return promptTemplate.replace(/\${language}/g, language);
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

const PROMPT_DIR = path.join(__dirname, './', 'prompt');

function loadPromptTemplate(fileName: string): string {
  const filePath = path.join(PROMPT_DIR, fileName);
  return fs.readFileSync(filePath, 'utf-8');
}
