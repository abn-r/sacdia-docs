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

  it('configures the administrative portal as a private static site', () => {
    const manifest = JSON.parse(readFileSync('apps/administrativo/package.json', 'utf8')) as {
      name: string;
      scripts: Record<string, string>;
    };
    const config = readFileSync('apps/administrativo/astro.config.mjs', 'utf8');
    const headers = readFileSync('apps/administrativo/public/_headers', 'utf8');

    expect(manifest.name).toBe('@sacdia/docs-administrativo');
    expect(config).toContain("output: 'static'");
    expect(config).toContain('process.env.PUBLIC_ADMINISTRATIVO_URL');
    expect(config).toContain("content: 'noindex,nofollow'");
    expect(config).toContain("directory: 'finanzas'");
    expect(headers).toContain('X-Robots-Tag: noindex, nofollow');
    expect(`${config}\n${headers}`).not.toMatch(/(password|secret|token)\s*[:=]\s*['"][^'"]+/i);
    expect(manifest.scripts.check).toContain('ASTRO_TELEMETRY_DISABLED=1');
  });

  it('configures the technical portal with private technical categories', () => {
    const manifest = JSON.parse(readFileSync('apps/tecnico/package.json', 'utf8')) as {
      name: string;
      scripts: Record<string, string>;
    };
    const config = readFileSync('apps/tecnico/astro.config.mjs', 'utf8');
    const headers = readFileSync('apps/tecnico/public/_headers', 'utf8');

    expect(manifest.name).toBe('@sacdia/docs-tecnico');
    expect(config).toContain("output: 'static'");
    expect(config).toContain("content: 'noindex,nofollow'");
    for (const directory of [
      'api',
      'arquitectura',
      'base-de-datos',
      'seguridad',
      'integracion',
      'estandares',
      'producto',
      'frontend',
      'guias',
      'testing',
      'referencia',
    ]) {
      expect(config).toContain(`directory: '${directory}'`);
    }
    expect(headers).toContain('X-Robots-Tag: noindex, nofollow');
    expect(`${config}\n${headers}`).not.toMatch(/(password|secret|token)\s*[:=]\s*['"][^'"]+/i);
    expect(manifest.scripts.check).toContain('ASTRO_TELEMETRY_DISABLED=1');
  });
});
