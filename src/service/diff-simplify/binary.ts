import type { DiffFile } from '../../utils/diff-parser';
import type { Simplifier } from './types';

/**
 * 二进制文件策略
 */
export class BinarySimplifier implements Simplifier {
  name = 'binary';
  match(file: DiffFile) {
    return file.isBinary;
  }
  execute(file: DiffFile) {
    const header = `diff --git a/${file.oldPath || file.filePath} b/${file.filePath}`;
    const action = file.isNew ? 'added' : file.isDeleted ? 'deleted' : 'modified';
    return `${header}\n[binary] ${action}`;
  }
}
