import { z } from 'zod';

export const documentSurfaceSchema = z.enum([
  'app',
  'admin',
  'cross-surface',
  'technical',
]);

export const documentTypeSchema = z.enum(['screen', 'process', 'reference', 'concept']);

export const sacdiaDocumentSchema = z
  .object({
    title: z.string().trim().min(3),
    description: z.string().trim().min(20),
    surface: documentSurfaceSchema,
    documentType: documentTypeSchema,
    module: z.string().trim().min(2),
    status: z.enum(['draft', 'published', 'deprecated']).default('draft'),
    owners: z.array(z.string().trim().min(2)).min(1),
    lastReviewedAt: z.coerce.date(),
    generated: z.boolean().default(false),
  })
  .superRefine((document, context) => {
    if (document.documentType === 'screen' && document.surface === 'technical') {
      context.addIssue({
        code: 'custom',
        path: ['surface'],
        message: 'Technical documents cannot be classified as screen manuals.',
      });
    }

    if (document.documentType === 'process' && document.surface === 'technical') {
      context.addIssue({
        code: 'custom',
        path: ['surface'],
        message: 'Technical workflows must be classified as references or concepts.',
      });
    }
  });

export type SacdiaDocument = z.infer<typeof sacdiaDocumentSchema>;
