import type { DiffFile } from '../../utils/diff-parser';
import type { Simplifier } from './types';

const LOCK_FILE_SUFFIXES = ['package-lock.json', 'pnpm-lock.yaml', '.lock'];

/**
 * Lock 文件策略
 */
export class LockFileSimplifier implements Simplifier {
  name = 'lock';
  match(file: DiffFile) {
    return LOCK_FILE_SUFFIXES.some((suffix) => file.filePath.toLowerCase().endsWith(suffix));
  }
  execute(file: DiffFile) {
    const header = `diff --git a/${file.oldPath || file.filePath} b/${file.filePath}`;
    const lineInfo = `(+${file.additions} -${file.deletions} lines)`;
    return `${header}\n[lock] modified ${lineInfo}`;
  }
}
