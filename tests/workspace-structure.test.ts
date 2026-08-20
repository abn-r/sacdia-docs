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

  it('configures the operational portal as a public static Spanish site', () => {
    const manifest = JSON.parse(readFileSync('apps/operativo/package.json', 'utf8')) as {
      name: string;
      scripts: Record<string, string>;
    };
    const config = readFileSync('apps/operativo/astro.config.mjs', 'utf8');

    expect(manifest.name).toBe('@sacdia/docs-operativo');
    expect(config).toContain("output: 'static'");
    expect(config).toContain('locales: {');
    expect(config).toContain("root: { label: 'Español', lang: 'es' }");
    expect(config).toContain('items: [{ autogenerate:');
    expect(config).toContain('pagefind: true');
    expect(config).not.toContain('middleware');
    expect(manifest.scripts.check).toContain('ASTRO_TELEMETRY_DISABLED=1');
  });
});
