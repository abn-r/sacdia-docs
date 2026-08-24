import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

interface CoverageRow {
  surface: 'admin' | 'app';
  module: string;
  route_or_feature: string;
  manual_path: string;
  processes: string;
  status: string;
  owner: string;
}

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

function readCoverage(): CoverageRow[] {
  const [headerLine, ...lines] = readFileSync(
    'docs/migration/surface-coverage.csv',
    'utf8',
  ).trim().split('\n');
  const headers = parseCsvLine(headerLine);

  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])) as unknown as CoverageRow;
  });
}

function resolveContentPath(row: CoverageRow, path: string): string | undefined {
  const portal = row.surface === 'app' ? 'operativo' : 'administrativo';
  const relativePath = path.replace(/^\//, '').replace(/\/$/, '');
  const root = `apps/${portal}/src/content/docs/${relativePath}`;

  if (existsSync(`${root}.mdx`)) return `${root}.mdx`;
  if (existsSync(`${root}/index.mdx`)) return `${root}/index.mdx`;
  return undefined;
}

function contentPathExists(row: CoverageRow, path: string): boolean {
  return resolveContentPath(row, path) !== undefined;
}

function listMdxFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? listMdxFiles(path) : path.endsWith('.mdx') ? [path] : [];
  });
}

function portalPathExists(portal: 'operativo' | 'administrativo', path: string): boolean {
  const relativePath = path.replace(/^\//, '').replace(/\/$/, '');
  const root = `apps/${portal}/src/content/docs/${relativePath}`;
  return relativePath === '' || existsSync(`${root}.mdx`) || existsSync(`${root}/index.mdx`);
}

describe('manual coverage matrix', () => {
  const rows = readCoverage();

  it('keeps the complete 171-surface inventory', () => {
    expect(rows).toHaveLength(171);
    expect(rows.filter((row) => row.surface === 'admin')).toHaveLength(134);
    expect(rows.filter((row) => row.surface === 'app')).toHaveLength(37);
  });

  it('maps every surface to an existing published manual', () => {
    const missing = rows.filter(
      (row) => row.status !== 'covered' || !contentPathExists(row, row.manual_path),
    );

    expect(missing, JSON.stringify(missing, null, 2)).toEqual([]);
  });

  it('maps every declared process to an existing process guide', () => {
    const brokenProcesses = rows.flatMap((row) =>
      row.processes
        .split('|')
        .filter(Boolean)
        .filter((path) => !contentPathExists(row, path))
        .map((path) => ({ surface: row.surface, module: row.module, path })),
    );

    expect(brokenProcesses, JSON.stringify(brokenProcesses, null, 2)).toEqual([]);
  });

  it('keeps every mapped manual published, verifiable and source-traceable', () => {
    const invalid = [...new Map(rows.map((row) => {
      const path = resolveContentPath(row, row.manual_path);
      return [`${row.surface}:${row.manual_path}`, path];
    })).values()].flatMap((path) => {
      if (!path) return [{ path, reason: 'missing' }];
      const source = readFileSync(path, 'utf8');
      const required = [
        'documentType: screen',
        'status: published',
        '## Resultado esperado',
        '## Cómo verificarlo',
        '## Fuente de verificación',
      ];
      return required.filter((marker) => !source.includes(marker)).map((marker) => ({ path, marker }));
    });

    expect(invalid, JSON.stringify(invalid, null, 2)).toEqual([]);
  });

  it('keeps every mapped process published and end-to-end', () => {
    const processEntries = rows.flatMap((row) =>
      row.processes.split('|').filter(Boolean).map((processPath) => ({ row, processPath })),
    );
    const unique = new Map(processEntries.map(({ row, processPath }) => [
      `${row.surface}:${processPath}`,
      resolveContentPath(row, processPath),
    ]));
    const invalid = [...unique.values()].flatMap((path) => {
      if (!path) return [{ path, reason: 'missing' }];
      const source = readFileSync(path, 'utf8');
      const required = [
        'documentType: process',
        'status: published',
        '## Flujo completo',
        '## Cómo verificarlo',
        '## Fuente de verificación',
      ];
      return required.filter((marker) => !source.includes(marker)).map((marker) => ({ path, marker }));
    });

    expect(invalid, JSON.stringify(invalid, null, 2)).toEqual([]);
  });

  it.each(['operativo', 'administrativo'] as const)(
    'keeps internal links valid in the %s portal',
    (portal) => {
      const root = `apps/${portal}/src/content/docs`;
      const brokenLinks = listMdxFiles(root).flatMap((file) => {
        const source = readFileSync(file, 'utf8');
        const paths = [...source.matchAll(/\]\((\/[a-z0-9/_-]+\/)\)/g)].map((match) => match[1]);

        return paths
          .filter((path) => !portalPathExists(portal, path))
          .map((path) => ({ file, path }));
      });

      expect(brokenLinks, JSON.stringify(brokenLinks, null, 2)).toEqual([]);
    },
  );
});
