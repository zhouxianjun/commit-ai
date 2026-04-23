import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as cheerio from 'cheerio';

const DEV_URL = 'http://localhost:5173';

type Asset = {
  tag: 'script' | 'link';
  type?: string;
  href?: string;
  src?: string;
  rel?: string;
  crossorigin?: string;
};

export const getHtmlForWebview = (
  webviewPath: string,
  webview: vscode.Webview,
  isDev: boolean = false
): string => {
  if (isDev) {
    return generateHtml([
      {
        tag: 'script',
        type: 'module',
        src: `${DEV_URL}/@vite/client`
      },
      {
        tag: 'script',
        type: 'module',
        src: `${DEV_URL}/src/main.ts`
      }
    ]);
  }
  const assets = getHtmlAssets(webviewPath, webview);
  return generateHtml(assets);
};

const getHtmlAssets = (webviewPath: string, webview: vscode.Webview): Asset[] => {
  const htmlPath = path.join(webviewPath, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const $ = cheerio.load(html);
  const assets: Asset[] = [];
  $('script').each((i, el) => {
    const src = $(el).attr('src');
    if (src) {
      assets.push({
        tag: 'script',
        type: $(el).attr('type'),
        crossorigin: $(el).attr('crossorigin'),
        src: webview.asWebviewUri(vscode.Uri.file(path.join(webviewPath, src))).toString()
      });
    }
  });
  $('link').each((i, el) => {
    const href = $(el).attr('href');
    if (href) {
      assets.push({
        tag: 'link',
        rel: $(el).attr('rel'),
        crossorigin: $(el).attr('crossorigin'),
        href: webview.asWebviewUri(vscode.Uri.file(path.join(webviewPath, href))).toString()
      });
    }
  });
  return assets;
};

const generateHtml = (
  assets?: { tag: 'script' | 'link'; type?: string; href?: string; src?: string }[]
) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CommitAI Settings</title>
</head>
<body>
    <div id="app"></div>
    ${assets?.map(generateAssetElement).join('\n')}
</body>
</html>`;
};

const generateAssetElement = (asset: Asset) => {
  return `<${asset.tag} ${asset.type ? `type="${asset.type}"` : ''} ${asset.rel ? `rel="${asset.rel}"` : ''} ${asset.crossorigin ? `crossorigin="${asset.crossorigin}"` : ''} ${asset.href ? `href="${asset.href}"` : ''} ${asset.src ? `src="${asset.src}"` : ''}></${asset.tag}>`;
};
