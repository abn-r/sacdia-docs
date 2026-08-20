import path from 'node:path';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createSyncPaths } from './sync-paths';

describe('documentation sync outputs', () => {
  it('keeps every generated artifact inside the technical portal', () => {
    const root = path.resolve('/workspace/sacdia-docs');
    const outputs = createSyncPaths(root);
    const technicalRoot = path.join(root, 'apps/tecnico/src/content/docs');

    expect(outputs).toEqual({
      endpoints: path.join(technicalRoot, 'api/endpoints.mdx'),
      schema: path.join(technicalRoot, 'base-de-datos/schema-reference/_generated-models.mdx'),
      versions: path.join(technicalRoot, 'estandares/stack-tecnologico/_generated-versions.mdx'),
    });
    expect(Object.values(outputs).every((output) => output.startsWith(technicalRoot))).toBe(true);
  });

  it('uses atomic writes and contains no legacy output paths', () => {
    for (const script of ['sync-endpoints.ts', 'sync-schema.ts', 'sync-versions.ts']) {
      const source = readFileSync(path.join('scripts', script), 'utf8');
      expect(source).toContain('atomicWriteFile');
      expect(source).toContain('createSyncPaths');
      expect(source).not.toMatch(/['"]content['"],\s*['"]dev['"]/);
    }
  });
});
