import { Container } from 'inversify';
import * as vscode from 'vscode';
import { ConfigService } from './config-service';
import { LLMServerService } from './llm-server-service';
import { TokenService } from './token-service';
import { StatusBarService } from './status-bar-service';
import { ModelContextService } from './model-context';
import { Context } from '../consts';
import { CommandService } from './command-service';
import { CommitService } from './commit-service';
import { PromptService } from './prompt-service';
import { ProviderService } from './provider-service';

export const container = new Container();

const services = [
  ConfigService,
  LLMServerService,
  ModelContextService,
  PromptService,
  TokenService,
  StatusBarService,
  ProviderService,
  CommitService,
  CommandService
] as const;
export const initContainer = (context: vscode.ExtensionContext) => {
  container.bind<vscode.ExtensionContext>(Context).toConstantValue(context);

  services.forEach((service) => {
    container.bind<any>(service).toSelf().inSingletonScope();

    if ('dispose' in service.prototype) {
      context.subscriptions.push(container.get<any>(service));
    }
  });
};
