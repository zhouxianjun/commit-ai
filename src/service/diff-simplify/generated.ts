import type { DiffFile } from '../../utils/diff-parser';
import type { Simplifier } from './types';

const GENERATED_PATTERNS: RegExp[] = [/\.generated\.\w+$/, /\.g\.\w+$/];

/**
 * 自动生成文件策略
 */
export class GeneratedFileSimplifier implements Simplifier {
  name = 'generated';
  match(file: DiffFile) {
    return GENERATED_PATTERNS.some((p) => p.test(file.filePath));
  }
  execute(file: DiffFile) {
    const header = `diff --git a/${file.oldPath || file.filePath} b/${file.filePath}`;
    const action = file.isNew ? 'added' : file.isDeleted ? 'deleted' : 'modified';
    const lineInfo = `(+${file.additions} -${file.deletions} lines)`;
    return `${header}\n[generated] ${action} ${lineInfo}`;
  }
}
