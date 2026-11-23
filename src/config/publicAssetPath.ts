export function publicAssetPath(base: string, filename: string): string {
  return `${base.endsWith('/') ? base : `${base}/`}${filename.replace(/^\/+/, '')}`;
}
