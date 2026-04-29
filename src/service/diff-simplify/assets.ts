import type { DiffFile } from '../../utils/diff-parser';
import type { Simplifier } from './types';
import * as path from 'path';

const ASSET_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.bmp',
  '.ico',
  '.tiff',
  '.svg',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  '.mp3',
  '.mp4',
  '.avi',
  '.mov',
  '.wav',
  '.ogg',
  '.flac',
  '.zip',
  '.tar',
  '.gz',
  '.rar',
  '.7z',
  '.wasm',
  '.so',
  '.dll',
  '.pyc',
  '.class',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.psd',
  '.sketch',
  '.map',
  '.snap',
  '.csv',
  '.tsv'
]);

const MINIFIED_SUFFIXES = ['.min.js', '.min.css'];

/**
 * 资源文件策略
 */
export class AssetSimplifier implements Simplifier {
  name = 'asset';
  match(file: DiffFile) {
    const ext = path.extname(file.filePath).toLowerCase();
    if (ASSET_EXTENSIONS.has(ext)) {
      return true;
    }
    if (MINIFIED_SUFFIXES.some((suffix) => file.filePath.toLowerCase().endsWith(suffix))) {
      return true;
    }
    return false;
  }
  execute(file: DiffFile) {
    const header = `diff --git a/${file.oldPath || file.filePath} b/${file.filePath}`;
    const action = file.isNew ? 'added' : file.isDeleted ? 'deleted' : 'modified';
    const ext = path.extname(file.filePath).slice(1) || 'file';
    return `${header}\n[asset] ${action} (${ext})`;
  }
}
