import * as vscode from 'vscode';
import { DISPLAY_NAME } from '../consts';

export type DebouncedPromiseFunc<F extends (...args: any[]) => any> = ((
  ...args: Parameters<F>
) => Promise<Awaited<ReturnType<F>>>) & {
  cancel: () => void;
};

const DEFAULT_FAVICON =
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsSAAALEgHS3X78AAACiElEQVQ4EaVTzU8TURCf2tJuS7tQtlRb6UKBIkQwkRRSEzkQgyEc6lkOKgcOph78Y+CgjXjDs2i44FXY9AMTlQRUELZapVlouy3d7kKtb0Zr0MSLTvL2zb75eL838xtTvV6H/xELBptMJojeXLCXyobnyog4YhzXYvmCFi6qVSfaeRdXdrfaU1areV5KykmX06rcvzumjY/1ggkR3Jh+bNf1mr8v1D5bLuvR3qDgFbvbBJYIrE1mCIoCrKxsHuzK+Rzvsi29+6DEbTZz9unijEYI8ObBgXOzlcrx9OAlXyDYKUCzwwrDQx1wVDGg089Dt+gR3mxmhcUnaWeoxwMbm/vzDFzmDEKMMNhquRqduT1KwXiGt0vre6iSeAUHNDE0d26NBtAXY9BACQyjFusKuL2Ry+IPb/Y9ZglwuVscdHaknUChqLF/O4jn3V5dP4mhgRJgwSYm+gV0Oi3XrvYB30yvhGa7BS70eGFHPoTJyQHhMK+F0ZesRVVznvXw5Ixv7/C10moEo6OZXbWvlFAF9FVZDOqEABUMRIkMd8GnLwVWg9/RkJF9sA4oDfYQAuzzjqzwvnaRUFxn/X2ZlmGLXAE7AL52B4xHgqAUqrC1nSNuoJkQtLkdqReszz/9aRvq90NOKdOS1nch8TpL555WDp49f3uAMXhACRjD5j4ykuCtf5PP7Fm1b0DIsl/VHGezzP1KwOiZQobFF9YyjSRYQETRENSlVzI8iK9mWlzckpSSCQHVALmN9Az1euDho9Xo8vKGd2rqooA8yBcrwHgCqYR0kMkWci08t/R+W4ljDCanWTg9TJGwGNaNk3vYZ7VUdeKsYJGFNkfSzjXNrSX20s4/h6kB81/271ghG17l+rPTAAAAAElFTkSuQmCC';

/**
 * Adds progress handling functionality.
 */
export class ProgressHandler {
  static async withProgress<T>(
    title: string,
    task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
  ): Promise<T> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `[${DISPLAY_NAME}] ${title}`,
        cancellable: true
      },
      task
    );
  }
}

export const zeroToUndefined = (value?: number) => (value === 0 ? undefined : value);

export const fetchFavicon = async (domain: string, size: number = 128) => {
  const res = await fetch(`https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`, {
    credentials: 'include',
    mode: 'cors'
  });
  const blob = await res.blob();
  const buffer = await blob.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  if (base64 === DEFAULT_FAVICON) {
    return null;
  }
  return `data:${blob.type};base64,${base64}`;
};

/**
 * Debounce a promise-returning function.
 * Only the last call within the wait period will be executed.
 * If a new call is made while a previous one is still executing, the previous result is discarded.
 */
export function debouncePromise<F extends (...args: any[]) => any>(
  func: F,
  wait: number = 0
): DebouncedPromiseFunc<F> {
  let timeout: NodeJS.Timeout | undefined;
  let latestId = 0;

  const cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  };
  const fn: DebouncedPromiseFunc<F> = (...args: Parameters<F>) => {
    const currentId = ++latestId;

    cancel();

    return new Promise<Awaited<ReturnType<F>>>((resolve, reject) => {
      timeout = setTimeout(async () => {
        try {
          const result = await func(...args);
          // Only resolve/reject if this is still the latest call
          if (currentId === latestId) {
            resolve(result);
          }
        } catch (error) {
          if (currentId === latestId) {
            reject(error);
          }
        }
      }, wait);
    });
  };

  fn.cancel = cancel;

  return fn;
}

/**
 * Yields control back to the event loop.
 */
export const yieldToMain = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Maps an array with yielding to the event loop every few items.
 */
export async function mapWithYield<T, R>(
  items: T[],
  handler: (item: T, index: number) => R | Promise<R>,
  yieldInterval: number = 10,
  signal?: AbortSignal
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i++) {
    if (signal?.aborted) {
      return results;
    }
    results.push(await handler(items[i], i));
    if ((i + 1) % yieldInterval === 0) {
      await yieldToMain();
    }
  }
  return results;
}
