// @vitest-environment node

import { describe, expect, it } from 'vitest';
import viteConfig from '../../vite.config';
import { publicAssetPath } from './publicAssetPath';

function resolveConfig(command: 'serve' | 'build') {
  if (typeof viteConfig === 'function') {
    return viteConfig({
      command,
      mode: 'test',
      isSsrBuild: false,
      isPreview: false,
    });
  }

  return viteConfig;
}

describe('GitHub Pages deployment path', () => {
  it('keeps the local development server at the root path', () => {
    expect(resolveConfig('serve')).toMatchObject({ base: '/' });
  });

  it('builds assets under the repository subpath', () => {
    expect(resolveConfig('build')).toMatchObject({
      base: '/indoor-wiring-learning/',
    });
  });

  it('resolves third-question public assets below the deployed base path', () => {
    expect(publicAssetPath('/indoor-wiring-learning/', 'b11-q3-official-schematic.png'))
      .toBe('/indoor-wiring-learning/b11-q3-official-schematic.png');
  });
});
