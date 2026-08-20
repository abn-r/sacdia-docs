import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  adminPageToCoverage,
  mobileFeatureToCoverage,
  surfaceCoverageToCsv,
  type SurfaceCoverageRow,
} from './lib/surface-inventory';

const root = process.cwd();
const adminRoot = path.resolve(root, '../sacdia-admin/src/app');
const appFeaturesRoot = path.resolve(root, '../sacdia-app/lib/features');
const output = path.join(root, 'docs/migration/surface-coverage.csv');

async function findAdminPages(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return findAdminPages(target);
    return entry.isFile() && entry.name === 'page.tsx' ? [target] : [];
  }));

  return pages.flat();
}

async function main(): Promise<void> {
  const adminRows = (await findAdminPages(adminRoot))
    .map((file) => adminPageToCoverage(path.relative(adminRoot, file)))
    .filter((row): row is SurfaceCoverageRow => row !== null);
  const appRows = (await readdir(appFeaturesRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => mobileFeatureToCoverage(entry.name))
    .filter((row): row is SurfaceCoverageRow => row !== null);
  const rows = [...adminRows, ...appRows]
    .sort((left, right) => `${left.surface}/${left.route_or_feature}`.localeCompare(`${right.surface}/${right.route_or_feature}`));

  if (rows.some((row) => !row.surface || !row.module || !row.manual_path)) {
    throw new Error('La matriz contiene filas incompletas.');
  }

  await writeFile(output, surfaceCoverageToCsv(rows), 'utf8');
  process.stdout.write(`Inventariadas ${adminRows.length} pantallas administrativas y ${appRows.length} features móviles.\n`);
}

void main();
