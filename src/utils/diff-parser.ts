import { lineIterator } from './string';

export interface DiffHunk {
  readonly header: string;
  readonly lines: string[];
}

export interface DiffFile {
  filePath: string;
  oldPath?: string;
  isBinary: boolean;
  isNew: boolean;
  isDeleted: boolean;
  isRenamed: boolean;
  hunks: DiffHunk[];
  lines: string[]; // 该文件的完整原始 diff
  bodyCharCount: number; // 仅 body 部分（hunk lines）的字符数
  additions: number;
  deletions: number;
}

export interface DiffParserOptions {
  collectLines?: boolean;
}

interface ParseContext {
  file: DiffFile | null;
  options?: DiffParserOptions;
  currentHunk: DiffHunk | null;
  // 是否停止解析
  stopParsing: boolean;
}
interface DiffParser {
  name: string;
  order: number;
  match?(ctx: ParseContext, line: string): boolean;
  onLine(ctx: ParseContext, line: string): void | 'break';
}
const DIFF_FILE_RE = /^diff --git a\/("?)(.+?)\1 b\/("?)(.+?)\3$/;
const HUNK_HEADER_RE = /^@@\s*-(\d+)(?:,(\d+))?\s*\+(\d+)(?:,(\d+))?\s*@@/;

const fileStartParser: DiffParser = {
  name: 'file-start',
  order: 0,
  onLine(ctx, line) {
    const match = line.match(DIFF_FILE_RE);
    if (!match) {
      return;
    }

    const [, , oldPath, , filePath] = match;

    ctx.file = {
      filePath,
      oldPath: oldPath !== filePath ? oldPath : undefined,
      isBinary: false,
      isNew: false,
      isDeleted: false,
      isRenamed: false,
      hunks: [],
      additions: 0,
      deletions: 0,
      bodyCharCount: 0,
      lines: []
    };

    ctx.currentHunk = null;
    ctx.stopParsing = false;

    return 'break';
  }
};

const metadataParser: DiffParser = {
  name: 'metadata',
  order: 10,
  onLine(ctx, line) {
    if (!ctx.file || ctx.currentHunk) {
      return;
    }

    if (line.startsWith('new file mode')) {
      ctx.file.isNew = true;
    }
    if (line.startsWith('deleted file mode')) {
      ctx.file.isDeleted = true;
    }
    if (line.startsWith('rename from') || line.startsWith('rename to')) {
      ctx.file.isRenamed = true;
    }

    if (line.startsWith('Binary files') || line.startsWith('GIT binary patch')) {
      ctx.file.isBinary = true;
      ctx.stopParsing = true;
      return 'break';
    }
  }
};

const hunkHeaderParser: DiffParser = {
  name: 'hunk-header',
  order: 20,
  onLine(ctx, line) {
    if (!ctx.file) {
      return;
    }

    if (!HUNK_HEADER_RE.test(line)) {
      return;
    }

    const hunk: DiffHunk = { header: line, lines: [] };
    ctx.file.hunks.push(hunk);

    ctx.currentHunk = hunk;

    return 'break';
  }
};

const hunkLineParser: DiffParser = {
  name: 'hunk-line',
  order: 30,
  onLine(ctx, line) {
    if (!ctx.file || !ctx.currentHunk) {
      return;
    }

    ctx.currentHunk.lines.push(line);
    ctx.file.bodyCharCount += line.length + 1;

    if (line.startsWith('+') && !line.startsWith('+++')) {
      ctx.file.additions++;
    }
    if (line.startsWith('-') && !line.startsWith('---')) {
      ctx.file.deletions++;
    }
  }
};

const PARSERS: DiffParser[] = [
  fileStartParser,
  metadataParser,
  hunkHeaderParser,
  hunkLineParser
].sort((a, b) => a.order - b.order);

export async function* parseDiff(
  rawDiff: string | AsyncIterable<string>,
  options?: {
    collectLines?: boolean;
  }
): AsyncGenerator<DiffFile> {
  const ctx: ParseContext = {
    file: null,
    currentHunk: null,
    options,
    stopParsing: false
  };
  const finalizeFile = () => {
    if (ctx.file) {
      const { file } = ctx;
      ctx.file = null;
      ctx.currentHunk = null;
      ctx.stopParsing = false;
      return file;
    }
    return null;
  };
  const lineIter = typeof rawDiff === 'string' ? lineIterator(rawDiff) : rawDiff;
  for await (const line of lineIter) {
    if (DIFF_FILE_RE.test(line)) {
      const finished = finalizeFile();
      if (finished) {
        yield finished;
      }
    }

    if (!ctx.stopParsing) {
      for (const parser of PARSERS) {
        const res = parser.onLine(ctx, line);
        if (res === 'break') {
          break;
        }
      }
    }

    if (options?.collectLines && ctx.file) {
      ctx.file.lines.push(line);
    }
  }

  // 循环结束后，yield 最后一个文件
  const finished = finalizeFile();
  if (finished) {
    yield finished;
  }
}

export async function toArray(diffFiles: AsyncGenerator<DiffFile>) {
  const array: DiffFile[] = [];
  for await (const val of diffFiles) {
    array.push(val);
  }
  return array;
}
