import type { InvokeRequest, InvokeResponse } from '@shared-types/shared';
import { createGlobalState } from '@vueuse/core';
import { onScopeDispose } from 'vue';

let invokeId = 0;
const invokeMap = new Map<
  number,
  { resolve: (value: any) => void; reject: (reason?: any) => void }
>();

export const useVSCode = createGlobalState(() => {
  const vscode = (window as any).acquireVsCodeApi();

  const invoke = <K extends keyof InvokeRequest>(
    command: K,
    args?: InvokeRequest[K]
  ): Promise<Awaited<InvokeResponse[K]>> => {
    return new Promise((resolve, reject) => {
      const id = invokeId++;
      invokeMap.set(id, { resolve, reject });
      vscode.postMessage({ command, args, id });
    });
  };

  const handleMessage = (event: MessageEvent) => {
    const { command, args, id, error } = event.data;
    if (command === 'response') {
      const handler = invokeMap.get(id);
      if (handler) {
        if (error) {
          handler.reject(error);
        } else {
          handler.resolve(args);
        }
        invokeMap.delete(id);
      }
    }
  };

  window.addEventListener('message', handleMessage);

  onScopeDispose(() => {
    window.removeEventListener('message', handleMessage);
  });

  return {
    invoke
  };
});
