import { describe, expect, it } from 'vitest';
import { sacdiaDocumentSchema } from './document-schema';

const baseDocument = {
  title: 'Registrar un pago',
  description: 'Completa y verifica el registro de un pago del club.',
  surface: 'admin',
  documentType: 'screen',
  module: 'finances',
  status: 'published',
  owners: ['operations'],
  lastReviewedAt: '2026-08-20',
};

describe('sacdiaDocumentSchema', () => {
  it('accepts a complete screen manual', () => {
    const result = sacdiaDocumentSchema.safeParse(baseDocument);

    expect(result.success).toBe(true);
  });

  it('accepts a process that crosses app and admin surfaces', () => {
    const result = sacdiaDocumentSchema.safeParse({
      ...baseDocument,
      title: 'Validar una carpeta anual',
      surface: 'cross-surface',
      documentType: 'process',
    });

    expect(result.success).toBe(true);
  });

  it('rejects documents without an owner or review date', () => {
    const result = sacdiaDocumentSchema.safeParse({
      ...baseDocument,
      owners: [],
      lastReviewedAt: undefined,
    });

    expect(result.success).toBe(false);
  });

  it('rejects a technical document presented as a screen manual', () => {
    const result = sacdiaDocumentSchema.safeParse({
      ...baseDocument,
      surface: 'technical',
      documentType: 'screen',
    });

    expect(result.success).toBe(false);
  });
});
