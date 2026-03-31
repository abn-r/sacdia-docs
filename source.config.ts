import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { z } from 'zod';
import { pageSchema } from 'fumadocs-core/source/schema';
import lastModified from 'fumadocs-mdx/plugins/last-modified';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      author: z.string().optional(),
      version: z.string().default('1.0.0'),
    }),
  },
});

export const devDocs = defineDocs({
  dir: 'content/dev',
  docs: {
    schema: pageSchema.extend({
      author: z.string().optional(),
      version: z.string().default('1.0.0'),
    }),
  },
});

export default defineConfig({
  plugins: [lastModified()],
});
