import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createInventoryRow, inventoryToCsv } from './lib/content-inventory';

const root = process.cwd();
const contentRoot = path.join(root, 'content');
const output = path.join(root, 'docs/migration/content-inventory.csv');

async function findMdxFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return findMdxFiles(target);
    return entry.isFile() && entry.name.endsWith('.mdx') ? [target] : [];
  }));

  return files.flat().sort();
}

async function main(): Promise<void> {
  const files = await findMdxFiles(contentRoot);
  const rows = await Promise.all(files.map(async (file) => {
    const sourcePath = path.relative(root, file).replaceAll(path.sep, '/');
    return createInventoryRow(sourcePath, await readFile(file, 'utf8'));
  }));

  if (rows.some((row) => !row.source_path || !row.target_path)) {
    throw new Error('El inventario contiene rutas vacías.');
  }

  await writeFile(output, inventoryToCsv(rows), 'utf8');
  process.stdout.write(`Inventariadas ${rows.length} páginas en ${path.relative(root, output)}.\n`);
}

void main();
