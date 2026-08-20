import path from 'node:path';

export function createSyncPaths(repositoryRoot: string) {
  const technicalRoot = path.join(repositoryRoot, 'apps/tecnico/src/content/docs');

  return {
    endpoints: path.join(technicalRoot, 'api/endpoints.mdx'),
    schema: path.join(technicalRoot, 'base-de-datos/schema-reference/_generated-models.mdx'),
    versions: path.join(technicalRoot, 'estandares/stack-tecnologico/_generated-versions.mdx'),
  } as const;
}
