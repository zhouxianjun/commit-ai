import { injectable, inject } from 'inversify';
import { ConfigKeys, ConfigService } from '../config-service';
import { parseDiff, toArray } from '../../utils/diff-parser';
import type { Simplifier, SimplifyOptions, SimplifyResult, SimplifyStats } from './types';
import { BinarySimplifier } from './binary';
import { AssetSimplifier } from './assets';
import { LockFileSimplifier } from './lock';
import { GeneratedFileSimplifier } from './generated';
import { TruncateSimplifier } from './truncate';

@injectable()
export class DiffSimplifyService {
  private simplifiers: Simplifier[];

  constructor(@inject(ConfigService) private configService: ConfigService) {
    this.simplifiers = [
      new BinarySimplifier(),
      new AssetSimplifier(),
      new LockFileSimplifier(),
      new GeneratedFileSimplifier(),
      new TruncateSimplifier()
    ];
  }

  public async simplify(rawDiff: string): Promise<SimplifyResult> {
    const enabled = this.configService.getConfig<boolean>(ConfigKeys.SMART_DIFF, true);
    if (!enabled || !rawDiff) {
      return {
        diff: rawDiff,
        simplified: false,
        stats: this.emptyStats(rawDiff)
      };
    }

    const maxFileChars = this.configService.getConfig<number>(
      ConfigKeys.SMART_DIFF_MAX_FILE_CHARS,
      20000
    );
    const options: SimplifyOptions = { maxFileChars };

    const fileIter = parseDiff(rawDiff, {
      collectLines: true
    });
    const files = await toArray(fileIter);

    let summarizedFiles = 0;
    let truncatedFiles = 0;

    const outputParts: string[] = files.map((file) => {
      for (const simplifier of this.simplifiers) {
        if (simplifier.match(file, options)) {
          if (simplifier.name === 'truncate') {
            truncatedFiles++;
          } else {
            summarizedFiles++;
          }
          return simplifier.execute(file, options);
        }
      }
      return file.lines.join('\n');
    });

    const resultDiff = outputParts.join('\n');
    return {
      diff: resultDiff,
      simplified: true,
      stats: {
        originalChars: rawDiff.length,
        simplifiedChars: resultDiff.length,
        summarizedFiles,
        truncatedFiles,
        savedPercent:
          rawDiff.length > 0 ? Math.round((1 - resultDiff.length / rawDiff.length) * 100) : 0
      }
    };
  }

  private emptyStats(rawDiff: string): SimplifyStats {
    const len = rawDiff?.length || 0;
    return {
      originalChars: len,
      simplifiedChars: len,
      summarizedFiles: 0,
      truncatedFiles: 0,
      savedPercent: 0
    };
  }
}
