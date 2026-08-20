import { describe, expect, it } from 'vitest';
import { migrateTechnicalFrontmatter } from './migrate-frontmatter';

const legacy = `---
title: "Endpoints"
description: "Referencia completa de endpoints de la API de SACDIA."
author: "Equipo SACDIA"
version: "2.2.0"
---

## Cuerpo

Contenido original.
`;

describe('technical frontmatter migration', () => {
  it('converts legacy metadata and preserves the body', () => {
    const migrated = migrateTechnicalFrontmatter(legacy, {
      module: 'api',
      generated: false,
      mdxRisk: 'low',
      reviewedAt: '2026-08-20',
    });

    expect(migrated).toContain('surface: technical');
    expect(migrated).toContain('documentType: reference');
    expect(migrated).toContain('module: api');
    expect(migrated).toContain('status: published');
    expect(migrated).toContain('owners:\n  - "Equipo SACDIA"');
    expect(migrated).toContain('lastReviewedAt: 2026-08-20');
    expect(migrated).not.toContain('version:');
    expect(migrated.endsWith('## Cuerpo\n\nContenido original.\n')).toBe(true);
  });

  it('marks generated and risky documents explicitly', () => {
    const migrated = migrateTechnicalFrontmatter(legacy, {
      module: 'frontend',
      generated: true,
      mdxRisk: 'high',
      reviewedAt: '2026-08-20',
    });

    expect(migrated).toContain('generated: true');
    expect(migrated).toContain('status: draft');
  });

  it('keeps documents pending editorial classification as drafts', () => {
    const migrated = migrateTechnicalFrontmatter(legacy, {
      module: 'revision',
      generated: false,
      mdxRisk: 'low',
      reviewedAt: '2026-08-20',
      publish: false,
    });

    expect(migrated).toContain('status: draft');
  });
});
