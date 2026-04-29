export interface SimplifyStats {
  originalChars: number;
  simplifiedChars: number;
  summarizedFiles: number;
  truncatedFiles: number;
  savedPercent: number;
}

export interface SimplifyResult {
  diff: string;
  simplified: boolean;
  stats: SimplifyStats;
}

export interface SimplifyOptions {
  maxFileChars: number;
}

export interface Simplifier {
  name: string;
  match(file: DiffFile, options: SimplifyOptions): boolean;
  execute(file: DiffFile, options: SimplifyOptions): string;
}
