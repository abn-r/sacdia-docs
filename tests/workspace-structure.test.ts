import { existsSync, readFileSync } from 'node:fs';
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
    const robots = readFileSync('apps/administrativo/public/robots.txt', 'utf8');

    expect(manifest.name).toBe('@sacdia/docs-administrativo');
    expect(config).toContain("output: 'static'");
    expect(config).toContain('process.env.PUBLIC_ADMINISTRATIVO_URL');
    expect(config).toContain("content: 'noindex,nofollow'");
    expect(config).toContain("directory: 'finanzas'");
    expect(headers).toContain('X-Robots-Tag: noindex, nofollow');
    expect(robots).toContain('Disallow: /');
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
    const robots = readFileSync('apps/tecnico/public/robots.txt', 'utf8');

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
    expect(robots).toContain('Disallow: /');
    expect(`${config}\n${headers}`).not.toMatch(/(password|secret|token)\s*[:=]\s*['"][^'"]+/i);
    expect(manifest.scripts.check).toContain('ASTRO_TELEMETRY_DISABLED=1');
  });

  it('contains no Fumadocs or Next.js runtime', () => {
    const manifest = JSON.parse(readFileSync('package.json', 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const legacyDependencies = Object.keys(manifest.dependencies ?? {})
      .filter((dependency) => dependency === 'next' || dependency.startsWith('fumadocs-'));

    expect(legacyDependencies).toEqual([]);
    for (const legacyPath of ['src', 'next.config.mjs', 'source.config.ts', 'postcss.config.mjs', 'content']) {
      expect(existsSync(legacyPath), `${legacyPath} todavía existe`).toBe(false);
    }
  });

  it('validates Astro portals without building and uses no legacy sync paths', () => {
    const validation = readFileSync('.github/workflows/validate-docs.yml', 'utf8');
    const drift = readFileSync('.github/workflows/drift-check.yml', 'utf8');
    const sync = readFileSync('.github/workflows/sync-docs.yml', 'utf8');

    expect(validation).toContain('pnpm test');
    expect(validation).toContain('pnpm check');
    expect(validation).not.toMatch(/pnpm (?:run )?build|astro build/);
    expect(`${drift}\n${sync}`).not.toContain('content/dev');
    expect(`${drift}\n${sync}`).toContain('apps/tecnico/src/content/docs');
  });

  it('imports shared Astro components through package exports without duplicate extensions', () => {
    for (const portal of ['operativo', 'administrativo', 'tecnico']) {
      const landing = readFileSync(`apps/${portal}/src/content/docs/index.mdx`, 'utf8');
      expect(landing).not.toMatch(/@sacdia\/docs-ui\/components\/[A-Za-z]+\.astro/);
      expect(landing).toContain('@sacdia/docs-ui/components/LandingHero');
    }
  });
});
