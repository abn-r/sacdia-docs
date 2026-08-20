/**
 * Generador de apps/tecnico/src/content/docs/api/endpoints.mdx
 *
 * Lee el OpenAPI spec generado por sacdia-backend (`pnpm openapi:generate` → sacdia-api-spec.json)
 * y produce un MDX con todos los endpoints agrupados por tag.
 *
 * Uso:
 *   pnpm tsx scripts/sync-endpoints.ts
 *   pnpm tsx scripts/sync-endpoints.ts --spec ../sacdia-backend/sacdia-api-spec.json
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { atomicWriteFile } from './lib/atomic-write';
import { createSyncPaths } from './lib/sync-paths';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

interface ParameterObject {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: { type?: string; format?: string };
}

interface OperationObject {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: ParameterObject[];
  requestBody?: {
    required?: boolean;
    content?: Record<string, { schema?: { $ref?: string } }>;
  };
  responses?: Record<
    string,
    { description?: string; content?: Record<string, { schema?: { $ref?: string } }> }
  >;
  security?: Array<Record<string, unknown>>;
  deprecated?: boolean;
}

interface PathItemObject extends Partial<Record<Method, OperationObject>> {
  parameters?: ParameterObject[];
}

interface OpenApiSpec {
  openapi: string;
  info: { title: string; description?: string; version: string };
  paths: Record<string, PathItemObject>;
  components?: { schemas?: Record<string, unknown> };
}

interface Endpoint {
  method: string;
  path: string;
  tag: string;
  summary: string;
  description?: string;
  operationId?: string;
  authenticated: boolean;
  pathParams: string[];
  queryParams: string[];
  deprecated: boolean;
  requestRef?: string;
  responseRefs: string[];
}

function parseArgs() {
  const args = process.argv.slice(2);
  const flags: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      flags[args[i].replace('--', '')] = args[i + 1] ?? 'true';
      i++;
    }
  }
  return flags;
}

function ensureSpec(specPath: string): OpenApiSpec {
  if (!fs.existsSync(specPath)) {
    console.error(
      `❌ OpenAPI spec not found at: ${specPath}\n   Run \`pnpm tsx scripts/generate-openapi.ts\` in sacdia-backend first.`,
    );
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(specPath, 'utf8'));
}

const METHOD_ORDER: Method[] = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

function refName(ref?: string) {
  if (!ref) return undefined;
  const parts = ref.split('/');
  return parts[parts.length - 1];
}

function extractEndpoints(spec: OpenApiSpec): Endpoint[] {
  const out: Endpoint[] = [];

  for (const [routePath, pathItem] of Object.entries(spec.paths)) {
    for (const method of METHOD_ORDER) {
      const op = pathItem[method];
      if (!op) continue;

      const tag = (op.tags && op.tags[0]) || 'untagged';
      const pathParams = (op.parameters ?? []).filter((p) => p.in === 'path').map((p) => p.name);
      const queryParams = (op.parameters ?? [])
        .filter((p) => p.in === 'query')
        .map((p) => `${p.name}${p.required ? '' : '?'}`);

      const requestRef = refName(
        op.requestBody?.content?.['application/json']?.schema?.$ref ??
          op.requestBody?.content?.['multipart/form-data']?.schema?.$ref,
      );

      const responseRefs: string[] = [];
      for (const [status, resp] of Object.entries(op.responses ?? {})) {
        const r = refName(resp.content?.['application/json']?.schema?.$ref);
        if (r) responseRefs.push(`${status}:${r}`);
      }

      out.push({
        method: method.toUpperCase(),
        path: routePath,
        tag,
        summary: op.summary ?? op.operationId ?? '',
        description: op.description,
        operationId: op.operationId,
        authenticated: Boolean(op.security && op.security.length > 0),
        pathParams,
        queryParams,
        deprecated: Boolean(op.deprecated),
        requestRef,
        responseRefs,
      });
    }
  }

  return out;
}

function groupByTag(endpoints: Endpoint[]) {
  const groups = new Map<string, Endpoint[]>();
  for (const ep of endpoints) {
    const list = groups.get(ep.tag) ?? [];
    list.push(ep);
    groups.set(ep.tag, list);
  }
  // Sort tags alphabetically but pin common ones first
  const pinned = ['auth', 'users', 'admin', 'clubs'];
  const allTags = [...groups.keys()].sort((a, b) => {
    const ai = pinned.indexOf(a);
    const bi = pinned.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
  return allTags.map((tag) => ({
    tag,
    endpoints: groups.get(tag)!.sort((a, b) => a.path.localeCompare(b.path)),
  }));
}

function escapeMdx(s: string) {
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderMdx(spec: OpenApiSpec, endpoints: Endpoint[]) {
  const groups = groupByTag(endpoints);
  const today = new Date().toISOString().slice(0, 10);
  const total = endpoints.length;
  const authed = endpoints.filter((e) => e.authenticated).length;

  const header = `---
title: "Endpoints — Live Reference"
description: "Referencia completa de endpoints REST de SACDIA API. Generado automaticamente desde el OpenAPI spec del backend."
surface: technical
documentType: reference
module: api
status: published
owners:
  - "Auto-generated"
lastReviewedAt: ${today}
generated: true
---

{/*
  AUTO-GENERATED FILE — DO NOT EDIT MANUALLY.
  Source: sacdia-backend/sacdia-api-spec.json (via SwaggerModule.createDocument)
  Generator: sacdia-docs/scripts/sync-endpoints.ts
  Regenerate:
    cd sacdia-backend && pnpm tsx scripts/generate-openapi.ts
    cd ../sacdia-docs && pnpm tsx scripts/sync-endpoints.ts
*/}

## Resumen

| Metrica | Valor |
| --- | --- |
| API version | \`${spec.info.version}\` |
| Total endpoints | **${total}** |
| Autenticados (Bearer) | ${authed} |
| Tags / modulos | ${groups.length} |
| Generado | ${today} |
| Spec fuente | \`sacdia-backend/sacdia-api-spec.json\` |

> Esta pagina se regenera desde el OpenAPI spec del backend. Si ves drift contra el codigo, regenera con \`pnpm sync:endpoints\`. La autoridad final es \`SwaggerModule.createDocument\` corriendo sobre el codigo NestJS.

## Indice de modulos

${groups.map((g) => `- [${g.tag}](#${slug(g.tag)}) — ${g.endpoints.length} endpoints`).join('\n')}

`;

  const sections = groups
    .map(
      (g) => `
## ${g.tag}

${g.endpoints
  .map((ep) => {
    const lockIcon = ep.authenticated ? '🔒' : '🔓';
    const deprecated = ep.deprecated ? ' **(deprecated)**' : '';
    const params = ep.queryParams.length > 0 ? ` \`?${ep.queryParams.join('&')}\`` : '';
    const desc = ep.summary ? ` — ${escapeMdx(ep.summary)}` : '';
    return `- ${lockIcon} \`${ep.method} ${ep.path}\`${params}${deprecated}${desc}`;
  })
  .join('\n')}
`,
    )
    .join('\n---\n');

  return header + sections + '\n';
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

async function main() {
  const flags = parseArgs();
  const root = path.resolve(__dirname, '..');
  const defaultSpec = path.resolve(root, '..', 'sacdia-backend', 'sacdia-api-spec.json');
  const specPath = flags.spec ? path.resolve(process.cwd(), flags.spec) : defaultSpec;
  const outPath = createSyncPaths(root).endpoints;

  console.log(`📖 Reading OpenAPI spec from: ${specPath}`);
  const spec = ensureSpec(specPath);

  const endpoints = extractEndpoints(spec);
  console.log(`📊 Extracted ${endpoints.length} endpoints across ${new Set(endpoints.map((e) => e.tag)).size} tags`);

  await atomicWriteFile(outPath, () => renderMdx(spec, endpoints));
  console.log(`✅ Wrote ${outPath}`);
}

void main();
