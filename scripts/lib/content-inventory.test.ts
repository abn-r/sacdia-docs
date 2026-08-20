import { describe, expect, it } from 'vitest';
import {
  classifyLegacyDocument,
  detectGenerated,
  detectMdxRisk,
  parseFrontmatter,
} from './content-inventory';

describe('legacy content inventory', () => {
  it('extracts frontmatter and preserves the document body', () => {
    const document = parseFrontmatter('---\ntitle: API\nauthor: Equipo SACDIA\n---\n\n# Body');

    expect(document.attributes).toMatchObject({ title: 'API', author: 'Equipo SACDIA' });
    expect(document.body).toContain('# Body');
  });

  it('detects generated files from their banner', () => {
    expect(detectGenerated('<!-- AUTO-GENERATED FILE: do not edit -->')).toBe(true);
    expect(detectGenerated('# Manual escrito por el equipo')).toBe(false);
  });

  it('classifies known paths without publishing operational manuals automatically', () => {
    expect(classifyLegacyDocument('content/dev/api/endpoints.mdx')).toMatchObject({
      targetPortal: 'tecnico',
      targetPath: 'api/endpoints.mdx',
    });
    expect(classifyLegacyDocument('content/docs/autorizacion/roles.mdx')).toMatchObject({
      targetPortal: 'tecnico',
      targetPath: 'seguridad/autorizacion/roles.mdx',
    });
    expect(classifyLegacyDocument('content/dev/index.mdx').targetPath).toBe('referencia/index.mdx');
    expect(classifyLegacyDocument('content/docs/index.mdx')).toMatchObject({
      targetPortal: 'revisar',
      targetPath: 'revision/legacy-documentation-index.mdx',
    });
    expect(classifyLegacyDocument('content/docs/desconocido.mdx').targetPortal).toBe('revisar');
  });

  it('flags executable MDX but ignores examples inside fenced code blocks', () => {
    expect(detectMdxRisk("import Card from './Card.astro';\n\n<Card />")).toBe('high');
    expect(detectMdxRisk('```tsx\n<Card />\n```')).toBe('low');
  });
});
