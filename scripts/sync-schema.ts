/**
 * Generador de docs/dev/base-de-datos/schema-reference/_generated-models.mdx
 *
 * Lee sacdia-backend/prisma/schema.prisma y produce un MDX con todos los modelos,
 * sus campos, indices y relaciones (resumen).
 *
 * Uso:
 *   pnpm tsx scripts/sync-schema.ts
 *   pnpm tsx scripts/sync-schema.ts --schema ../sacdia-backend/prisma/schema.prisma
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

interface Field {
  name: string;
  type: string;
  modifiers: string;
  attributes: string;
}

interface Model {
  name: string;
  fields: Field[];
  blockAttributes: string[];
}

interface Enum {
  name: string;
  values: string[];
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

function parseSchema(src: string): { models: Model[]; enums: Enum[] } {
  const models: Model[] = [];
  const enums: Enum[] = [];

  const lines = src.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const modelMatch = /^\s*model\s+(\w+)\s*\{/.exec(line);
    const enumMatch = /^\s*enum\s+(\w+)\s*\{/.exec(line);

    if (modelMatch) {
      const name = modelMatch[1];
      const fields: Field[] = [];
      const blockAttributes: string[] = [];
      i++;
      while (i < lines.length && !/^\s*\}/.test(lines[i])) {
        const raw = lines[i].trim();
        if (raw === '' || raw.startsWith('//')) {
          i++;
          continue;
        }
        if (raw.startsWith('@@')) {
          blockAttributes.push(raw);
          i++;
          continue;
        }
        const fieldMatch = /^(\w+)\s+([\w\[\]\?]+)(.*)$/.exec(raw);
        if (fieldMatch) {
          const [, fname, type, rest] = fieldMatch;
          const modifiers = /\?|\[\]/.exec(type)?.[0] ?? '';
          const baseType = type.replace(/\?|\[\]/g, '');
          fields.push({
            name: fname,
            type: baseType,
            modifiers,
            attributes: rest.trim(),
          });
        }
        i++;
      }
      models.push({ name, fields, blockAttributes });
    } else if (enumMatch) {
      const name = enumMatch[1];
      const values: string[] = [];
      i++;
      while (i < lines.length && !/^\s*\}/.test(lines[i])) {
        const raw = lines[i].trim();
        if (raw && !raw.startsWith('//')) values.push(raw);
        i++;
      }
      enums.push({ name, values });
    }
    i++;
  }

  return { models, enums };
}

const SCALAR_TYPES = new Set([
  'Int',
  'BigInt',
  'String',
  'Boolean',
  'Float',
  'Decimal',
  'DateTime',
  'Json',
  'Bytes',
]);

function classifyField(field: Field, enumNames: Set<string>): 'scalar' | 'enum' | 'relation' {
  if (SCALAR_TYPES.has(field.type)) return 'scalar';
  if (enumNames.has(field.type)) return 'enum';
  return 'relation';
}

function bucketize(modelName: string): string {
  // Heuristica simple para agrupar por dominio (orden importa)
  if (/^(audit_logs)/.test(modelName)) return 'audit';
  if (/^(materiales|orders|order_items|product_variants|products|comprobantes|stock|warehouses)/.test(modelName))
    return 'materiales';
  if (/^(users_pr|users_roles|users_permissions|users_classes|users_honors|user_fcm_tokens|users)/.test(modelName))
    return 'users-auth';
  if (/^(roles|permissions|role_permissions|club_role_assignments)/.test(modelName)) return 'rbac';
  if (/^(clubs|club_sections|club_types|club_ideals|units|unit_members|ecclesiastical_years)/.test(modelName))
    return 'clubs';
  if (/^(activities|activity_)/.test(modelName)) return 'activities';
  if (/^(camporees|camporee_)/.test(modelName)) return 'camporees';
  if (/^(folders|folder_)/.test(modelName)) return 'folders-evidencias';
  if (/^(honors|user_honors|master_honors|honors_categories)/.test(modelName)) return 'honors';
  if (/^(classes|class_)/.test(modelName)) return 'classes';
  if (/^(certifications|investitures|investiture_)/.test(modelName)) return 'investidura';
  if (/^(member_insurances|legal_representatives|emergency_contacts|allergies|diseases|medicines)/.test(modelName))
    return 'health';
  if (/^(finances|finances_)/.test(modelName)) return 'finanzas';
  if (/^(club_inventory|inventory_)/.test(modelName)) return 'inventario';
  if (/^(notifications|notification_)/.test(modelName)) return 'notifications';
  if (/^(resources|resource_)/.test(modelName)) return 'resources';
  if (/^(countries|unions|local_fields|districts|churches|relationship_types)/.test(modelName))
    return 'organizacion';
  if (/_translations$/.test(modelName)) return 'i18n';
  return 'otros';
}

function escapeMdx(s: string) {
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderMdx(models: Model[], enums: Enum[]) {
  const enumNames = new Set(enums.map((e) => e.name));
  const today = new Date().toISOString().slice(0, 10);

  const buckets = new Map<string, Model[]>();
  for (const m of models) {
    const b = bucketize(m.name);
    const list = buckets.get(b) ?? [];
    list.push(m);
    buckets.set(b, list);
  }
  const bucketOrder = [
    'users-auth',
    'rbac',
    'clubs',
    'organizacion',
    'classes',
    'honors',
    'activities',
    'camporees',
    'folders-evidencias',
    'investidura',
    'health',
    'finanzas',
    'inventario',
    'materiales',
    'resources',
    'notifications',
    'audit',
    'i18n',
    'otros',
  ];

  const lines: string[] = [];
  lines.push(`---
title: "Modelos — Referencia Generada"
description: "Listado completo de modelos Prisma de SACDIA. Generado automaticamente desde sacdia-backend/prisma/schema.prisma."
author: "Auto-generated"
---

{/*
  AUTO-GENERATED FILE — DO NOT EDIT MANUALLY.
  Source: sacdia-backend/prisma/schema.prisma
  Generator: sacdia-docs/scripts/sync-schema.ts
  Regenerate: cd sacdia-docs && pnpm sync:schema
*/}

## Resumen

| Metrica | Valor |
| --- | --- |
| Total modelos | **${models.length}** |
| Total enums | ${enums.length} |
| Total campos | ${models.reduce((acc, m) => acc + m.fields.length, 0)} |
| Generado | ${today} |
| Fuente | \`sacdia-backend/prisma/schema.prisma\` |

> Las paginas por dominio (\`users-auth.mdx\`, \`clubs.mdx\`, etc.) son prosa manual. Esta pagina es el listado plano y siempre fresco.

## Indice por dominio

`);

  for (const bucket of bucketOrder) {
    const list = buckets.get(bucket);
    if (!list) continue;
    lines.push(`- [${bucket}](#${bucket}) — ${list.length} modelos`);
  }

  lines.push('\n---\n');

  for (const bucket of bucketOrder) {
    const list = buckets.get(bucket);
    if (!list || list.length === 0) continue;

    lines.push(`## ${bucket}\n`);

    for (const model of list.sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(`### \`${model.name}\`\n`);

      const scalars = model.fields.filter((f) => classifyField(f, enumNames) === 'scalar');
      const enumFields = model.fields.filter((f) => classifyField(f, enumNames) === 'enum');
      const relations = model.fields.filter((f) => classifyField(f, enumNames) === 'relation');

      lines.push('| Campo | Tipo | Notas |');
      lines.push('| --- | --- | --- |');
      for (const f of scalars) {
        const isPK = /@id/.test(f.attributes);
        const isUnique = /@unique/.test(f.attributes);
        const notes = [
          isPK ? 'PK' : '',
          isUnique ? 'UNIQUE' : '',
          f.modifiers === '?' ? 'optional' : '',
          f.modifiers === '[]' ? 'list' : '',
        ]
          .filter(Boolean)
          .join(', ');
        lines.push(`| \`${f.name}\` | \`${escapeMdx(f.type)}\` | ${notes || '—'} |`);
      }

      if (enumFields.length > 0) {
        lines.push('\n**Enums**:');
        for (const f of enumFields) {
          lines.push(`- \`${f.name}\`: \`${f.type}\``);
        }
      }

      if (relations.length > 0) {
        lines.push('\n**Relaciones**:');
        for (const f of relations) {
          const list = f.modifiers === '[]' ? ' (many)' : '';
          lines.push(`- \`${f.name}\` → \`${f.type}\`${list}`);
        }
      }

      if (model.blockAttributes.length > 0) {
        lines.push('\n**Bloque**:');
        for (const a of model.blockAttributes) {
          lines.push(`- \`${escapeMdx(a)}\``);
        }
      }

      lines.push('');
    }
  }

  if (enums.length > 0) {
    lines.push('\n---\n\n## Enums\n');
    for (const e of enums.sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(`### \`${e.name}\`\n`);
      for (const v of e.values) {
        lines.push(`- \`${v}\``);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

function main() {
  const flags = parseArgs();
  const root = path.resolve(__dirname, '..');
  const defaultSchema = path.resolve(root, '..', 'sacdia-backend', 'prisma', 'schema.prisma');
  const schemaPath = flags.schema ? path.resolve(process.cwd(), flags.schema) : defaultSchema;
  const outPath = path.resolve(root, 'content', 'dev', 'base-de-datos', 'schema-reference', '_generated-models.mdx');

  console.log(`📖 Reading Prisma schema from: ${schemaPath}`);
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema not found at: ${schemaPath}`);
    process.exit(1);
  }
  const src = fs.readFileSync(schemaPath, 'utf8');
  const { models, enums } = parseSchema(src);
  console.log(`📊 Parsed ${models.length} models, ${enums.length} enums`);

  const mdx = renderMdx(models, enums);
  fs.writeFileSync(outPath, mdx, 'utf8');
  console.log(`✅ Wrote ${outPath}`);
}

main();
