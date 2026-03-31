import { docs, devDocs } from 'collections/server';
import { loader } from 'fumadocs-core/source';

export const docsSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

export const devSource = loader({
  baseUrl: '/dev',
  source: devDocs.toFumadocsSource(),
});
