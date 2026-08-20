import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('documentation workspace', () => {
  it('declares application and shared package workspaces', () => {
    const workspace = readFileSync('pnpm-workspace.yaml', 'utf8');

    expect(workspace).toContain("'apps/*'");
    expect(workspace).toContain("'packages/*'");
  });

  it('exposes one check command per portal', () => {
    const manifest = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>;
    };

    expect(manifest.scripts).toMatchObject({
      'check:operativo': expect.any(String),
      'check:administrativo': expect.any(String),
      'check:tecnico': expect.any(String),
    });
  });
});
