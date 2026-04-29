import type { DiffFile } from '../../utils/diff-parser';
import type { Simplifier, SimplifyOptions } from './types';

/**
 * 超大文件截断策略 (按字符)
 */
export class TruncateSimplifier implements Simplifier {
  name = 'truncate';
  match(file: DiffFile, options: SimplifyOptions) {
    return file.bodyCharCount > options.maxFileChars;
  }
  execute(file: DiffFile, options: SimplifyOptions) {
    const raw = file.rawContent;
    // 寻找第一个 @@ 的位置，即 body 的开始
    const bodyIndex = raw.indexOf('\n@@');
    if (bodyIndex === -1) {
      return raw;
    }

    const header = raw.slice(0, bodyIndex + 1);
    const body = raw.slice(bodyIndex + 1);

    const maxChars = options.maxFileChars;
    const headLen = Math.floor(maxChars * 0.7);
    const tailLen = maxChars - headLen;

    // 为了避免在一行中间截断，尝试寻找换行符
    let adjustedHeadLen = headLen;
    const lastNewlineInHead = body.lastIndexOf('\n', headLen);
    if (lastNewlineInHead > headLen * 0.5) {
      adjustedHeadLen = lastNewlineInHead + 1;
    }

    let adjustedTailStart = body.length - tailLen;
    const firstNewlineInTail = body.indexOf('\n', body.length - tailLen);
    if (firstNewlineInTail !== -1 && firstNewlineInTail < body.length - tailLen * 0.5) {
      adjustedTailStart = firstNewlineInTail + 1;
    }

    const head = body.slice(0, adjustedHeadLen);
    const tail = body.slice(adjustedTailStart);
    const truncatedLen = body.length - (adjustedHeadLen + (body.length - adjustedTailStart));

    const summary = `\n[... truncated ~${truncatedLen} characters, showing first ${adjustedHeadLen} and last ${body.length - adjustedTailStart} of ~${body.length} total body characters ...]\n`;

    return header + head + summary + tail;
  }
}
