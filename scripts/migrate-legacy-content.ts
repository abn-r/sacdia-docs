import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { detectGenerated, detectMdxRisk, parseFrontmatter } from './lib/content-inventory';
import { migrateTechnicalFrontmatter } from './lib/migrate-frontmatter';

const root = process.cwd();
const technicalRoot = path.join(root, 'apps/tecnico/src/content/docs');

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
  let migrated = 0;

  for (const file of await findMdxFiles(technicalRoot)) {
    const source = await readFile(file, 'utf8');
    const { attributes } = parseFrontmatter(source);
    if (!('author' in attributes) && !('version' in attributes)) continue;

    const relativePath = path.relative(technicalRoot, file).replaceAll(path.sep, '/');
    const module = relativePath.split('/')[0].replace(/\.mdx$/, '');
    const isEditorialReview = relativePath === 'revision/legacy-documentation-index.mdx';
    const transformed = migrateTechnicalFrontmatter(source, {
      module,
      generated: detectGenerated(source),
      mdxRisk: detectMdxRisk(source),
      reviewedAt: '2026-08-20',
      publish: !isEditorialReview,
    });

    await writeFile(file, transformed, 'utf8');
    migrated += 1;
  }

  process.stdout.write(`Migrado el frontmatter de ${migrated} páginas técnicas.\n`);
}

void main();
