/**
 * Generador de apps/tecnico/src/content/docs/estandares/stack-tecnologico/_generated-versions.mdx
 *
 * Lee package.json (backend + admin) y pubspec.yaml (app) y produce
 * un MDX con tablas de versiones reales de todas las dependencias clave.
 *
 * Uso:
 *   pnpm tsx scripts/sync-versions.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { atomicWriteFile } from './lib/atomic-write';
import { createSyncPaths } from './lib/sync-paths';

interface PkgJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  engines?: { node?: string; pnpm?: string };
}

function readJson<T = unknown>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function readYaml(p: string): string | null {
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8');
}

function pickDeps(pkg: PkgJson | null, keys: string[]): Array<[string, string]> {
  if (!pkg) return [];
  const all = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  return keys
    .filter((k) => all[k])
    .map((k) => [k, all[k]] as [string, string]);
}

function parsePubspecDeps(src: string): Record<string, string> {
  const out: Record<string, string> = {};
  const lines = src.split(/\r?\n/);
  let inDeps = false;
  for (const line of lines) {
    if (/^(dependencies|dev_dependencies):\s*$/.test(line)) {
      inDeps = true;
      continue;
    }
    if (/^[a-zA-Z_]+:\s*$/.test(line) && !/^(dependencies|dev_dependencies):/.test(line)) {
      inDeps = false;
    }
    if (!inDeps) continue;
    const m = /^\s{2}([a-z_][a-z0-9_]*):\s*([^\s#]+)/i.exec(line);
    if (m) out[m[1]] = m[2].replace(/['"]/g, '');
  }
  return out;
}

function parsePubspecSdk(src: string): string | null {
  const m = /^\s*environment:\s*\n\s+sdk:\s*['"]?([^'"\s]+)/m.exec(src);
  return m ? m[1] : null;
}

function table(rows: Array<[string, string]>) {
  if (rows.length === 0) return '_(sin datos)_\n';
  return [
    '| Paquete | Version |',
    '| --- | --- |',
    ...rows.map(([k, v]) => `| \`${k}\` | \`${v}\` |`),
  ].join('\n');
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const repoRoot = path.resolve(root, '..');

  const backend = readJson<PkgJson>(path.resolve(repoRoot, 'sacdia-backend', 'package.json'));
  const admin = readJson<PkgJson>(path.resolve(repoRoot, 'sacdia-admin', 'package.json'));
  const pubspecSrc = readYaml(path.resolve(repoRoot, 'sacdia-app', 'pubspec.yaml'));
  const pubspecDeps = pubspecSrc ? parsePubspecDeps(pubspecSrc) : {};
  const dartSdk = pubspecSrc ? parsePubspecSdk(pubspecSrc) : null;

  const backendKeys = [
    '@nestjs/core',
    '@nestjs/common',
    '@nestjs/swagger',
    '@nestjs/throttler',
    '@nestjs/bullmq',
    '@nestjs/jwt',
    '@prisma/client',
    'prisma',
    'typescript',
    'better-auth',
    'bullmq',
    'ioredis',
    'firebase-admin',
    '@sentry/node',
    'class-validator',
    'class-transformer',
    '@aws-sdk/client-s3',
  ];

  const adminKeys = [
    'next',
    'react',
    'react-dom',
    'typescript',
    '@tanstack/react-query',
    'react-hook-form',
    'zod',
    'tailwindcss',
    'next-intl',
    'lucide-react',
    'vitest',
    'msw',
    '@testing-library/react',
  ];

  const appKeys = [
    'flutter_riverpod',
    'dio',
    'go_router',
    'flutter_secure_storage',
    'sentry_flutter',
    'hugeicons',
    'firebase_core',
    'firebase_messaging',
    'firebase_app_check',
    'easy_localization',
    'dartz',
    'freezed',
    'json_serializable',
    'cached_network_image',
    'fl_chart',
    'mobile_scanner',
    'google_maps_flutter',
    'secure_application',
    'local_auth',
  ];

  const today = new Date().toISOString().slice(0, 10);

  const mdx = `---
title: "Versiones — Stack actualizado"
description: "Tabla generada automaticamente con las versiones reales de las dependencias clave de backend, admin y app."
surface: technical
documentType: reference
module: standards
status: published
owners:
  - "Auto-generated"
lastReviewedAt: ${today}
generated: true
---

{/*
  AUTO-GENERATED FILE — DO NOT EDIT MANUALLY.
  Sources:
    - sacdia-backend/package.json
    - sacdia-admin/package.json
    - sacdia-app/pubspec.yaml
  Generator: sacdia-docs/scripts/sync-versions.ts
  Regenerate: cd sacdia-docs && pnpm sync:versions
*/}

> Generado: ${today}. Si ves drift contra los repos, corre \`pnpm sync:versions\`.

## Backend (sacdia-backend)

${table(pickDeps(backend, backendKeys))}

## Admin (sacdia-admin)

${table(pickDeps(admin, adminKeys))}

## App movil (sacdia-app)

**Dart SDK**: \`${dartSdk ?? 'no detectado'}\`

${table(appKeys.filter((k) => pubspecDeps[k]).map((k) => [k, pubspecDeps[k]]))}
`;

  const outPath = createSyncPaths(root).versions;
  await atomicWriteFile(outPath, () => mdx);
  console.log(`✅ Wrote ${outPath}`);
}

void main();
