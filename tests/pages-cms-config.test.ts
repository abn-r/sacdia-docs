import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Pages CMS editorial scope', () => {
  const config = readFileSync('.pages.yml', 'utf8');

  it('exposes one collection and media source per portal', () => {
    for (const portal of ['operativo', 'administrativo', 'tecnico']) {
      expect(config).toContain(`path: apps/${portal}/src/content/docs`);
      expect(config).toContain(`input: apps/${portal}/public/media`);
      expect(config).toContain(`media: ${portal}_media`);
    }
  });

  it('protects generated documents and unmanaged frontmatter', () => {
    expect(config).toContain('exclude:');
    expect(config).toContain('"**/_generated-*"');
    expect(config).toContain('merge: true');
    expect(config).toContain('name: generated');
    expect(config).toContain('readonly: true');
  });

  it('uses conventional commit templates with the editor identity', () => {
    expect(config).toContain('identity: user');
    expect(config).toContain('create: "docs: create {path}"');
    expect(config).toContain('update: "docs: update {path}"');
    expect(config).toContain('delete: "docs: remove {path}"');
    expect(config).toContain('rename: "docs: move {oldPath} to {newPath}"');
  });
});
