import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface CsvRow {
  [key: string]: string;
}

interface ReviewPage {
  sourcePath: string;
  sourceRoute: string;
  targetPath: string;
  targetRoute: string;
}

const technicalRoot = 'apps/tecnico/src/content/docs';

const reviewPages: ReviewPage[] = [
  {
    sourcePath: 'content/dev/api/integracion-frontend/testing.mdx',
    sourceRoute: '/dev/api/integracion-frontend/testing/',
    targetPath: 'api/integracion-frontend/testing.mdx',
    targetRoute: '/api/integracion-frontend/testing/',
  },
  {
    sourcePath: 'content/docs/guias/deployment.mdx',
    sourceRoute: '/docs/guias/deployment/',
    targetPath: 'guias/deployment.mdx',
    targetRoute: '/guias/deployment/',
  },
  {
    sourcePath: 'content/docs/index.mdx',
    sourceRoute: '/docs/',
    targetPath: 'revision/legacy-documentation-index.mdx',
    targetRoute: '/revision/legacy-documentation-index/',
  },
  {
    sourcePath: 'content/docs/sistema-de-diseno/patrones-crud.mdx',
    sourceRoute: '/docs/sistema-de-diseno/patrones-crud/',
    targetPath: 'frontend/sistema-de-diseno/patrones-crud.mdx',
    targetRoute: '/frontend/sistema-de-diseno/patrones-crud/',
  },
  {
    sourcePath: 'content/docs/sistema-de-diseno/stack-y-paleta.mdx',
    sourceRoute: '/docs/sistema-de-diseno/stack-y-paleta/',
    targetPath: 'frontend/sistema-de-diseno/stack-y-paleta.mdx',
    targetRoute: '/frontend/sistema-de-diseno/stack-y-paleta/',
  },
];

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"' && quoted) {
      current += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      values.push(current);
      current = '';
    } else {
      current += character;
    }
  }

  values.push(current);
  return values;
}

function readCsv(path: string): CsvRow[] {
  const [header, ...lines] = readFileSync(path, 'utf8').trim().split('\n');
  const columns = parseCsvLine(header);
  return lines.map((line) => Object.fromEntries(
    columns.map((column, index) => [column, parseCsvLine(line)[index] ?? '']),
  ));
}

function readTechnicalPage(path: string): string {
  return readFileSync(`${technicalRoot}/${path}`, 'utf8');
}

function expectMarkers(source: string, markers: string[]): void {
  for (const marker of markers) expect(source).toContain(marker);
}

function expectAbsent(source: string, markers: string[]): void {
  for (const marker of markers) expect(source).not.toContain(marker);
}

describe('closed legacy documentation review queue', () => {
  const inventory = readCsv('docs/migration/content-inventory.csv');
  const redirects = readCsv('docs/migration/redirects.csv');

  it('keeps all 98 inventory and redirect mappings ready in the technical portal', () => {
    expect(inventory).toHaveLength(98);
    expect(redirects).toHaveLength(98);
    expect(inventory.filter((row) => row.status !== 'ready')).toEqual([]);
    expect(redirects.filter((row) => row.status !== 'ready')).toEqual([]);

    for (const page of reviewPages) {
      expect(inventory.find((row) => row.source_path === page.sourcePath)).toMatchObject({
        target_portal: 'tecnico',
        target_path: page.targetPath,
        status: 'ready',
      });
      expect(redirects.find((row) => row.source_route === page.sourceRoute)).toMatchObject({
        target_portal: 'tecnico',
        target_route: page.targetRoute,
        status: 'ready',
      });
    }
  });

  it('publishes every reviewed technical page with complete technical metadata', () => {
    for (const page of reviewPages) {
      const path = `${technicalRoot}/${page.targetPath}`;
      expect(existsSync(path), path).toBe(true);
      const source = readFileSync(path, 'utf8');
      expectMarkers(source, [
        'surface: technical',
        'documentType: reference',
        'status: published',
        'owners:',
        'lastReviewedAt:',
        'generated: false',
      ]);
    }
  });

  it('documents only current testing practices, not fictitious hooks, classes, or Mockito', () => {
    const source = readTechnicalPage('api/integracion-frontend/testing.mdx');
    expectMarkers(source, ['Vitest', 'pnpm test', 'flutter test']);
    expectAbsent(source, ['useClubs', 'ClubsRemoteDataSource', 'Mockito', '@GenerateMocks', 'MockDio']);
  });

  it('documents deployment with the actual hosting boundary and pending store release', () => {
    const source = readTechnicalPage('guias/deployment.mdx');
    expectMarkers(source, ['Render', 'API_BASE_URL', 'versionado', 'servicios externos', 'pendiente']);
    expectAbsent(source, ['Swagger UI', 'swagger UI', 'pnpm build', 'CI/CD', 'Vercel']);
  });

  it('documents CRUD through real page, dialog, and sheet primitives without invented wrappers', () => {
    const source = readTechnicalPage('frontend/sistema-de-diseno/patrones-crud.mdx');
    expectMarkers(source, ['páginas dedicadas', '@/components/ui/alert-dialog', '@/components/ui/dialog', '@/components/ui/sheet']);
    expectAbsent(source, [
      'CatalogCrudPage',
      'PhaseECatalogCrudPage',
      'ConfirmDialog',
      'CatalogFormPage',
      'CatalogDeleteDialog',
      'pnpm build',
    ]);
  });

  it('uses Scout Vibrante default palette and cites its canonical runtime sources', () => {
    const source = readTechnicalPage('frontend/sistema-de-diseno/stack-y-paleta.mdx');
    expectMarkers(source, [
      'Scout Vibrante',
      '`default`',
      'sacdia-admin/DESIGN-SYSTEM.md',
      'sacdia-admin/src/app/globals.css',
      'sacdia-admin/src/lib/preferences/theme.ts',
    ]);
    expectAbsent(source, ['Paleta Ember', 'naranja cobre Ember']);
  });

  it('keeps the legacy index as a canonical five-link landing without legacy routes', () => {
    const source = readTechnicalPage('revision/legacy-documentation-index.mdx');
    const canonicalRoutes = [
      '/arquitectura/fundamentos/',
      '/seguridad/autorizacion/',
      '/producto/funcionalidades/',
      '/frontend/sistema-de-diseno/',
      '/guias/',
    ];

    expectMarkers(source, canonicalRoutes);
    expectAbsent(source, ['/docs/']);
    expect([...source.matchAll(/\]\(\/[^)#?]+\)/g)]).toHaveLength(5);
  });

  it('keeps reviewed pages reachable from their technical indexes', () => {
    expectMarkers(readTechnicalPage('api/integracion-frontend/index.mdx'), [
      '](/api/integracion-frontend/testing)',
    ]);
    const guides = readTechnicalPage('guias/index.mdx');
    expect(guides.match(/\]\(\/guias\/deployment\)/g)).toHaveLength(2);
    expectMarkers(readTechnicalPage('frontend/sistema-de-diseno/index.mdx'), [
      '](/frontend/sistema-de-diseno/patrones-crud)',
      '](/frontend/sistema-de-diseno/stack-y-paleta)',
    ]);
  });

  it('reports the closed queue while preserving the independent 171-surface coverage matrix', () => {
    const report = readFileSync('docs/migration/verification-report.md', 'utf8');
    expect(report).toMatch(/\| Páginas listas(?: según reglas automáticas| tras revisión técnica) \| 98 \|/);
    expect(report).toContain('| Páginas que requieren revisión editorial/MDX | 0 |');

    const coverage = readCsv('docs/migration/surface-coverage.csv');
    expect(coverage).toHaveLength(171);
    expect(coverage.filter((row) => row.surface === 'admin')).toHaveLength(134);
    expect(coverage.filter((row) => row.surface === 'app')).toHaveLength(37);
    expect(coverage.filter((row) => row.status !== 'covered')).toEqual([]);
  });
});
