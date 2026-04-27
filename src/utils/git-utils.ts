import simpleGit from 'simple-git';
import * as vscode from 'vscode';
import type { API } from './git';

export interface DiffOptions {
  excludeFiles?: string[];
}

export interface GitExtension {
  readonly enabled: boolean;
  readonly onDidChangeEnablement: vscode.Event<boolean>;

  /**
   * Returns a specific API version.
   *
   * Throws error if git extension is disabled. You can listed to the
   * [GitExtension.onDidChangeEnablement](#GitExtension.onDidChangeEnablement) event
   * to know when the extension becomes enabled/disabled.
   *
   * @param version Version number.
   * @returns API instance
   */
  getAPI(version: 1): API;
}

/**
 * Retrieves the staged changes from the Git repository.
 */
export async function getDiffStaged(
  repo: any,
  options: DiffOptions = {}
): Promise<{ diff: string; error?: string; isEmpty: boolean }> {
  try {
    const rootPath = repo?.rootUri?.fsPath || vscode.workspace.workspaceFolders?.[0].uri.fsPath;

    if (!rootPath) {
      throw new Error('No workspace folder found');
    }

    const git = simpleGit(rootPath);
    const { excludeFiles = [] } = options;

    const pathspecs = ['--'];
    excludeFiles.forEach((pattern) => {
      if (pattern) {
        pathspecs.push(`:(exclude)${pattern}`);
      }
    });
    const diff = await git.diff(['--staged', ...pathspecs]);

    return {
      diff: diff || 'No changes staged.',
      error: null,
      isEmpty: !diff
    };
  } catch (error) {
    console.error('Error reading Git diff:', error);
    return { diff: '', error: error.message, isEmpty: true };
  }
}

export const getGitApi = () => {
  try {
    const extension = vscode.extensions.getExtension<GitExtension>('vscode.git');
    if (!extension) {
      return undefined;
    }

    if (!extension.isActive) {
      return undefined;
    }

    return extension.exports.getAPI(1);
  } catch (error) {
    console.error('Failed to get Git API:', error);
    return undefined;
  }
};

export const getCurrentGitRepository = () => {
  const api = getGitApi();
  return api?.repositories[0];
};
