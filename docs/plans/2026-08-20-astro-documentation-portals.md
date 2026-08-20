# SACDIA Astro Documentation Portals Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reemplazar la aplicación Fumadocs por tres portales Astro + Starlight estáticos, personalizados y desplegables de forma independiente.

**Architecture:** El repositorio se convertirá en un workspace pnpm con aplicaciones `operativo`, `administrativo` y `tecnico`. Los portales compartirán configuración, esquemas editoriales y componentes visuales, pero mantendrán contenido, búsqueda, dominio y política de acceso independientes.

**Tech Stack:** Astro, Starlight, TypeScript, MDX, Zod, Vitest, Pagefind, Pages CMS, Cloudflare Pages y Cloudflare Access.

**Constraint:** No ejecutar `pnpm build` ni ningún build durante esta tarea. Los comandos de build se documentan para CI y despliegue, pero requieren una autorización posterior explícita.

---

## Orden de revisión

1. Revisar primero los manifests del workspace y los tres `astro.config.mjs`.
2. Revisar después `packages/content` y la matriz de migración.
3. Revisar los scripts de generación antes de aceptar contenido técnico generado.
4. Revisar finalmente Pages CMS, workflows y el runbook de Cloudflare Access.

## Límites de entrega

- Cada tarea termina en un commit conventional commit sin atribución de IA.
- Fumadocs se conserva hasta que los tres portales pasen `astro check` y las pruebas estructurales.
- El contenido existente no se publica como manual operativo sin clasificación editorial.
- Las credenciales, correos permitidos y secretos de Cloudflare no se guardan en Git.

### Task 1: Convertir la raíz en un workspace pnpm

**Files:**
- Modify: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `vitest.config.ts`
- Create: `tests/workspace-structure.test.ts`
- Modify: `.gitignore`

**Step 1: Escribir la prueba estructural que falla**

Crear `tests/workspace-structure.test.ts` para verificar:

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('workspace', () => {
  it('declares apps and shared packages', () => {
    const yaml = readFileSync('pnpm-workspace.yaml', 'utf8');
    expect(yaml).toContain("'apps/*'");
    expect(yaml).toContain("'packages/*'");
  });

  it('exposes one check command per portal', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.scripts).toMatchObject({
      'check:operativo': expect.any(String),
      'check:administrativo': expect.any(String),
      'check:tecnico': expect.any(String),
    });
  });
});
```

**Step 2: Ejecutar la prueba y confirmar el fallo**

Run: `pnpm exec vitest run tests/workspace-structure.test.ts`

Expected: FAIL porque `pnpm-workspace.yaml` y los scripts todavía no existen.

**Step 3: Crear el workspace mínimo**

`pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Reemplazar los scripts Next/Fumadocs de `package.json` por comandos filtrados:

```json
{
  "scripts": {
    "dev:operativo": "pnpm --filter @sacdia/docs-operativo dev",
    "dev:administrativo": "pnpm --filter @sacdia/docs-administrativo dev",
    "dev:tecnico": "pnpm --filter @sacdia/docs-tecnico dev",
    "check": "pnpm -r --if-present check",
    "check:operativo": "pnpm --filter @sacdia/docs-operativo check",
    "check:administrativo": "pnpm --filter @sacdia/docs-administrativo check",
    "check:tecnico": "pnpm --filter @sacdia/docs-tecnico check",
    "test": "vitest run",
    "sync:endpoints": "tsx scripts/sync-endpoints.ts",
    "sync:schema": "tsx scripts/sync-schema.ts",
    "sync:versions": "tsx scripts/sync-versions.ts",
    "sync:all": "pnpm sync:endpoints && pnpm sync:schema && pnpm sync:versions"
  }
}
```

Mantener temporalmente las dependencias Fumadocs hasta la Task 13. Añadir `vitest` como dependencia de desarrollo y eliminar del `.gitignore` las entradas exclusivas de Next solo al retirar el legado.

**Step 4: Instalar y fijar dependencias del workspace**

Run: `pnpm install`

Expected: `pnpm-lock.yaml` actualizado sin errores. Este comando instala dependencias; NO es un build.

**Step 5: Ejecutar la prueba**

Run: `pnpm test -- tests/workspace-structure.test.ts`

Expected: PASS.

**Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml pnpm-workspace.yaml vitest.config.ts tests/workspace-structure.test.ts .gitignore
git commit -m "chore: initialize docs workspace"
```

### Task 2: Crear el registro compartido de portales

**Files:**
- Create: `packages/config/package.json`
- Create: `packages/config/src/portals.ts`
- Create: `packages/config/src/index.ts`
- Create: `packages/config/src/portals.test.ts`
- Create: `packages/config/tsconfig.json`

**Step 1: Escribir las pruebas de configuración**

Verificar que existan exactamente tres portales, que los privados no sean indexables y que cada identificador tenga audiencia distinta.

```ts
expect(Object.keys(PORTALS)).toEqual(['operativo', 'administrativo', 'tecnico']);
expect(PORTALS.operativo.access).toBe('public');
expect(PORTALS.administrativo.robots).toBe('noindex');
expect(PORTALS.tecnico.robots).toBe('noindex');
```

**Step 2: Confirmar el fallo**

Run: `pnpm test -- packages/config/src/portals.test.ts`

Expected: FAIL porque `PORTALS` no existe.

**Step 3: Implementar el registro tipado**

Definir `PortalId`, `PortalDefinition` y `PORTALS` con:

- nombre y descripción;
- audiencia;
- tipo de acceso;
- política de robots;
- color/acento identificador;
- variable de entorno para el dominio final.

No hardcodear dominios productivos todavía. Usar rutas locales como fallback.

**Step 4: Verificar**

Run: `pnpm test -- packages/config/src/portals.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add packages/config
git commit -m "feat: add shared portal registry"
```

### Task 3: Definir el contrato editorial común

**Files:**
- Create: `packages/content/package.json`
- Create: `packages/content/src/document-schema.ts`
- Create: `packages/content/src/document-schema.test.ts`
- Create: `packages/content/src/index.ts`
- Create: `packages/content/templates/screen-manual.mdx`
- Create: `packages/content/templates/process-guide.mdx`

**Step 1: Escribir pruebas del schema**

Cubrir:

- manual de pantalla válido;
- proceso transversal válido;
- rechazo sin `owners`;
- rechazo sin `lastReviewedAt`;
- rechazo de combinaciones imposibles entre `surface` y `documentType`.

El schema base esperado:

```ts
const sacdiaDocumentSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  surface: z.enum(['app', 'admin', 'technical']),
  documentType: z.enum(['screen', 'process', 'reference', 'concept']),
  module: z.string().min(2),
  status: z.enum(['draft', 'published', 'deprecated']).default('draft'),
  owners: z.array(z.string().min(2)).min(1),
  lastReviewedAt: z.coerce.date(),
});
```

**Step 2: Confirmar el fallo**

Run: `pnpm test -- packages/content/src/document-schema.test.ts`

Expected: FAIL.

**Step 3: Implementar schema y plantillas**

Las plantillas deben seguir esta secuencia:

1. resultado esperado;
2. requisitos previos;
3. pasos;
4. verificación;
5. errores frecuentes;
6. siguiente paso.

**Step 4: Verificar**

Run: `pnpm test -- packages/content/src/document-schema.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add packages/content
git commit -m "feat: define documentation content model"
```

### Task 4: Crear el sistema visual compartido de SACDIA

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/src/styles/tokens.css`
- Create: `packages/ui/src/styles/starlight.css`
- Create: `packages/ui/src/components/PortalHeader.astro`
- Create: `packages/ui/src/components/PortalSwitcher.astro`
- Create: `packages/ui/src/components/LandingHero.astro`
- Create: `packages/ui/src/components/TaskCard.astro`
- Create: `packages/ui/src/components/DocumentMeta.astro`
- Create: `packages/ui/src/components/index.ts`
- Create: `packages/ui/tests/a11y-contract.test.ts`

**Step 1: Escribir pruebas contractuales de accesibilidad**

Comprobar que:

- el selector de portales tiene etiqueta accesible;
- la navegación usa elementos semánticos;
- los acentos `#F06151`, `#183651` y `#4FBF9F` están centralizados en tokens;
- los componentes no contienen estilos de color duplicados.

**Step 2: Confirmar el fallo**

Run: `pnpm test -- packages/ui/tests/a11y-contract.test.ts`

Expected: FAIL porque el paquete visual no existe.

**Step 3: Implementar componentes**

Aplicar `@frontend-design` durante esta tarea. La portada debe priorizar búsqueda y tareas frecuentes, no una lista de archivos. Mantener contraste AA, foco visible, tipografía legible y responsive desde 320 px.

**Step 4: Verificar pruebas estructurales**

Run: `pnpm test -- packages/ui/tests/a11y-contract.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add packages/ui
git commit -m "feat: add sacdia documentation ui"
```

### Task 5: Crear la aplicación operativa

**Files:**
- Create: `apps/operativo/package.json`
- Create: `apps/operativo/astro.config.mjs`
- Create: `apps/operativo/tsconfig.json`
- Create: `apps/operativo/src/content.config.ts`
- Create: `apps/operativo/src/content/docs/index.mdx`
- Create: `apps/operativo/src/content/docs/primeros-pasos/index.mdx`
- Create: `apps/operativo/src/components/Header.astro`
- Create: `apps/operativo/src/styles/custom.css`
- Create: `apps/operativo/public/favicon.svg`

**Step 1: Extender la prueba del workspace**

Verificar nombre de paquete, salida estática, idioma `es` y ausencia de middleware de autenticación.

**Step 2: Confirmar el fallo**

Run: `pnpm test -- tests/workspace-structure.test.ts`

Expected: FAIL porque `apps/operativo` no existe.

**Step 3: Implementar el sitio vertical mínimo**

Configurar Starlight con:

- título “SACDIA — Manual operativo”;
- `lang: 'es'`;
- Pagefind habilitado;
- componentes visuales compartidos;
- navegación inicial por Primeros pasos, Pantallas, Procesos y Ayuda;
- metadatos indexables.

**Step 4: Validar sin build**

Run: `pnpm check:operativo`

Expected: PASS de `astro check`. NO ejecutar `pnpm build`.

**Step 5: Commit**

```bash
git add apps/operativo tests/workspace-structure.test.ts
git commit -m "feat: add operational documentation portal"
```

### Task 6: Crear la aplicación administrativa

**Files:**
- Create: `apps/administrativo/package.json`
- Create: `apps/administrativo/astro.config.mjs`
- Create: `apps/administrativo/tsconfig.json`
- Create: `apps/administrativo/src/content.config.ts`
- Create: `apps/administrativo/src/content/docs/index.mdx`
- Create: `apps/administrativo/src/content/docs/primeros-pasos/index.mdx`
- Create: `apps/administrativo/src/components/Header.astro`
- Create: `apps/administrativo/src/styles/custom.css`
- Create: `apps/administrativo/public/_headers`

**Step 1: Añadir la prueba de privacidad estática**

Verificar `robots: noindex`, cabecera `X-Robots-Tag: noindex, nofollow` y ausencia de credenciales en código.

**Step 2: Confirmar el fallo**

Run: `pnpm test -- tests/workspace-structure.test.ts`

Expected: FAIL.

**Step 3: Implementar el sitio**

Configurar navegación inicial por Inicio, Clubes, Finanzas, Materiales, Investiduras, Configuración y Procesos. La privacidad real quedará en Cloudflare Access; `_headers` solo añade defensa contra indexación.

**Step 4: Validar sin build**

Run: `pnpm check:administrativo`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/administrativo tests/workspace-structure.test.ts
git commit -m "feat: add administrative documentation portal"
```

### Task 7: Crear la aplicación técnica

**Files:**
- Create: `apps/tecnico/package.json`
- Create: `apps/tecnico/astro.config.mjs`
- Create: `apps/tecnico/tsconfig.json`
- Create: `apps/tecnico/src/content.config.ts`
- Create: `apps/tecnico/src/content/docs/index.mdx`
- Create: `apps/tecnico/src/content/docs/api/index.mdx`
- Create: `apps/tecnico/src/components/Header.astro`
- Create: `apps/tecnico/src/styles/custom.css`
- Create: `apps/tecnico/public/_headers`

**Step 1: Añadir pruebas de privacidad y categorías**

Verificar `noindex` y las categorías API, Arquitectura, Base de datos, Seguridad, Integración y Estándares.

**Step 2: Confirmar el fallo**

Run: `pnpm test -- tests/workspace-structure.test.ts`

Expected: FAIL.

**Step 3: Implementar el sitio**

Configurar salida estática, Pagefind separado y shell compartido. No reutilizar el índice del portal administrativo.

**Step 4: Validar sin build**

Run: `pnpm check:tecnico`

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/tecnico tests/workspace-structure.test.ts
git commit -m "feat: add technical documentation portal"
```

### Task 8: Inventariar y clasificar las 98 páginas actuales

**Files:**
- Create: `scripts/lib/content-inventory.ts`
- Create: `scripts/lib/content-inventory.test.ts`
- Create: `scripts/create-content-inventory.ts`
- Create: `docs/migration/content-inventory.csv`
- Create: `docs/migration/README.md`

**Step 1: Escribir pruebas del inventario**

Usar fixtures para probar:

- extracción de frontmatter;
- detección de archivos generados;
- clasificación `operativo | administrativo | tecnico | revisar`;
- detección de JSX/MDX que requiere adaptación;
- conservación de la ruta de origen.

**Step 2: Confirmar el fallo**

Run: `pnpm test -- scripts/lib/content-inventory.test.ts`

Expected: FAIL.

**Step 3: Implementar el inventario**

El CSV debe incluir:

```text
source_path,target_portal,target_path,generated,mdx_risk,status,owner,notes
```

Reglas iniciales:

- `content/dev/**` → técnico;
- `content/docs/autorizacion/**` → técnico;
- `content/docs/fundamentos/**` → técnico;
- `content/docs/guias/**` → técnico;
- `content/docs/sistema-de-diseno/**` → técnico;
- `content/docs/funcionalidades/**` → técnico hasta revisión editorial;
- ninguna página se clasifica automáticamente como manual operativo.

**Step 4: Generar y verificar el inventario**

Run: `pnpm exec tsx scripts/create-content-inventory.ts`

Expected: CSV con 98 páginas y ninguna ruta vacía.

Run: `pnpm test -- scripts/lib/content-inventory.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/lib scripts/create-content-inventory.ts docs/migration
git commit -m "docs: inventory legacy documentation content"
```

### Task 9: Migrar contenido técnico compatible

**Files:**
- Move: `content/dev/**` → `apps/tecnico/src/content/docs/**`
- Move: `content/docs/autorizacion/**` → `apps/tecnico/src/content/docs/seguridad/autorizacion/**`
- Move: `content/docs/fundamentos/**` → `apps/tecnico/src/content/docs/arquitectura/fundamentos/**`
- Move: `content/docs/guias/**` → `apps/tecnico/src/content/docs/guias/**`
- Move: `content/docs/sistema-de-diseno/**` → `apps/tecnico/src/content/docs/frontend/sistema-de-diseno/**`
- Move: `content/docs/funcionalidades/**` → `apps/tecnico/src/content/docs/producto/funcionalidades/**`
- Create: `scripts/lib/migrate-frontmatter.ts`
- Create: `scripts/lib/migrate-frontmatter.test.ts`
- Create: `docs/migration/redirects.csv`

**Step 1: Escribir pruebas para transformar frontmatter**

Probar la conversión de `author` y `version` al schema nuevo, la preservación del cuerpo y el marcado de archivos generados.

**Step 2: Confirmar el fallo**

Run: `pnpm test -- scripts/lib/migrate-frontmatter.test.ts`

Expected: FAIL.

**Step 3: Implementar y ejecutar la migración**

Usar `git mv` para conservar historia. No convertir ejemplos JSX ciegamente: marcar los documentos con riesgo alto como `draft` y corregir únicamente sintaxis incompatible demostrada por `astro check`.

**Step 4: Registrar redirecciones**

El CSV debe mapear `/docs/...` y `/dev/...` a su portal y ruta futura. Las rutas sin equivalencia quedarán con `status=review`.

**Step 5: Validar sin build**

Run: `pnpm test -- scripts/lib/migrate-frontmatter.test.ts`

Run: `pnpm check:tecnico`

Expected: PASS.

**Step 6: Commit**

```bash
git add apps/tecnico content scripts/lib docs/migration
git commit -m "docs: migrate legacy content to technical portal"
```

### Task 10: Crear la matriz de cobertura de pantallas y procesos

**Files:**
- Create: `scripts/create-surface-inventory.ts`
- Create: `scripts/lib/surface-inventory.ts`
- Create: `scripts/lib/surface-inventory.test.ts`
- Create: `docs/migration/surface-coverage.csv`

**Step 1: Escribir pruebas con rutas de ejemplo**

Cubrir rutas Next del panel y features Flutter, excluyendo layouts, componentes internos y pantallas exclusivamente técnicas.

**Step 2: Confirmar el fallo**

Run: `pnpm test -- scripts/lib/surface-inventory.test.ts`

Expected: FAIL.

**Step 3: Implementar el inventario**

El CSV debe incluir:

```text
surface,module,route_or_feature,manual_path,processes,status,owner
```

No generar manuales ficticios. Crear filas `missing` para que la cobertura sea medible.

**Step 4: Generar y verificar**

Run: `pnpm exec tsx scripts/create-surface-inventory.ts`

Expected: rutas del panel y features móviles detectadas; cada fila tiene portal y módulo.

**Step 5: Commit**

```bash
git add scripts docs/migration/surface-coverage.csv
git commit -m "docs: add documentation coverage matrix"
```

### Task 11: Hacer seguros y comprobables los generadores técnicos

**Files:**
- Modify: `scripts/sync-endpoints.ts`
- Modify: `scripts/sync-schema.ts`
- Modify: `scripts/sync-versions.ts`
- Create: `scripts/lib/atomic-write.ts`
- Create: `scripts/lib/atomic-write.test.ts`
- Create: `scripts/lib/sync-paths.ts`
- Create: `scripts/lib/sync-paths.test.ts`

**Step 1: Escribir pruebas de salida y escritura atómica**

Verificar que todos los generadores escriban bajo `apps/tecnico/src/content/docs`, creen directorios faltantes y no reemplacen el archivo válido si falla el render.

**Step 2: Confirmar el fallo**

Run: `pnpm test -- scripts/lib/atomic-write.test.ts scripts/lib/sync-paths.test.ts`

Expected: FAIL porque siguen apuntando a `content/dev`.

**Step 3: Refactorizar generadores**

Separar parseo, render y escritura. Añadir frontmatter del schema común y banner `AUTO-GENERATED FILE`. Usar archivo temporal y `rename` atómico.

**Step 4: Verificar con fixtures**

Run: `pnpm test -- scripts/lib/atomic-write.test.ts scripts/lib/sync-paths.test.ts`

Expected: PASS.

No ejecutar `pnpm sync:all` si faltan los repos o artefactos fuente requeridos.

**Step 5: Commit**

```bash
git add scripts
git commit -m "refactor: target technical portal in docs sync"
```

### Task 12: Configurar Pages CMS como editor visual

**Files:**
- Create: `.pages.yml`
- Create: `docs/editorial/pages-cms.md`
- Create: `tests/pages-cms-config.test.ts`

**Step 1: Escribir pruebas de alcance editorial**

Verificar que la configuración:

- use las tres rutas `apps/*/src/content/docs`;
- no permita editar archivos con prefijo `_generated-`;
- conserve campos no administrados;
- use mensajes de commit conventional commits;
- mantenga medios dentro del portal correspondiente.

**Step 2: Confirmar el fallo**

Run: `pnpm test -- tests/pages-cms-config.test.ts`

Expected: FAIL.

**Step 3: Implementar `.pages.yml`**

Crear colecciones diferenciadas y plantillas de commit como:

```yaml
settings:
  content:
    merge: true
  commit:
    identity: user
    templates:
      create: 'docs: create {path}'
      update: 'docs: update {path}'
      delete: 'docs: remove {path}'
```

Documentar que solo autores de confianza recibirán acceso al editor durante el MVP.

**Step 4: Verificar**

Run: `pnpm test -- tests/pages-cms-config.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add .pages.yml docs/editorial tests/pages-cms-config.test.ts
git commit -m "feat: configure visual documentation editor"
```

### Task 13: Actualizar automatizaciones y retirar Fumadocs

**Files:**
- Modify: `.github/workflows/drift-check.yml`
- Modify: `.github/workflows/sync-docs.yml`
- Create: `.github/workflows/validate-docs.yml`
- Delete: `src/**`
- Delete: `next.config.mjs`
- Delete: `next-env.d.ts`
- Delete: `source.config.ts`
- Delete: `postcss.config.mjs`
- Delete: `content/**` después de completar los moves
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `.env.example`
- Modify: `.gitignore`
- Delete: `.env` del checkout si está versionado; nunca mostrar ni copiar su contenido

**Step 1: Escribir pruebas de ausencia del legado**

Extender `tests/workspace-structure.test.ts` para rechazar dependencias `fumadocs-*`, `next`, el middleware Basic Auth y rutas de salida `content/dev`.

**Step 2: Confirmar el fallo**

Run: `pnpm test -- tests/workspace-structure.test.ts`

Expected: FAIL mientras Fumadocs exista.

**Step 3: Actualizar workflows**

Cambiar paths de drift hacia el portal técnico. `validate-docs.yml` ejecutará instalación congelada, tests y `astro check`; no añadir un build hasta que el usuario autorice esa política.

**Step 4: Eliminar el runtime legado**

Retirar Next, React y Fumadocs únicamente después de que Tasks 5–12 estén verdes. Regenerar el lockfile con `pnpm install`.

**Step 5: Verificar**

Run: `pnpm test -- tests/workspace-structure.test.ts`

Run: `pnpm check`

Expected: PASS sin referencias a Fumadocs.

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: replace fumadocs with astro portals"
```

### Task 14: Documentar despliegues y Cloudflare Access

**Files:**
- Create: `docs/deployment/cloudflare-pages.md`
- Create: `docs/deployment/cloudflare-access.md`
- Create: `docs/deployment/access-review-checklist.md`
- Modify: `.env.example`

**Step 1: Escribir el checklist verificable**

Debe exigir para cada sitio privado:

- dominio personalizado protegido;
- dominio raíz `pages.dev` protegido;
- previews `*.pages.dev` protegidos;
- política deny-by-default;
- OTP limitado por lista explícita de correos;
- `X-Robots-Tag` y `robots.txt` noindex;
- prueba anónima que no recibe HTML, assets ni índice Pagefind.

**Step 2: Documentar los tres proyectos Pages**

Registrar por portal:

- paquete workspace;
- comando de build para Cloudflare —solo documentado—;
- directorio de salida;
- watch paths;
- variable de dominio;
- política Access aplicable.

Ejemplo técnico documentado, NO ejecutar localmente:

```text
Build command: pnpm --filter @sacdia/docs-tecnico build
Output directory: apps/tecnico/dist
```

**Step 3: Documentar altas y bajas**

Una alta o baja del panel debe generar una tarea paralela para actualizar la lista administrativa. Los roles `admin` y `super_admin` forman inicialmente la lista técnica.

**Step 4: Commit**

```bash
git add docs/deployment .env.example
git commit -m "docs: add portal deployment runbooks"
```

### Task 15: Verificación final sin build

**Files:**
- Modify: `docs/migration/content-inventory.csv`
- Modify: `docs/migration/surface-coverage.csv`
- Create: `docs/migration/verification-report.md`

**Step 1: Ejecutar pruebas**

Run: `pnpm test`

Expected: PASS.

**Step 2: Ejecutar checks Astro**

Run: `pnpm check`

Expected: PASS para los tres portales.

**Step 3: Ejecutar validaciones Git**

Run: `git diff --check development...HEAD`

Expected: sin errores de whitespace.

Run: `git status --short`

Expected: limpio.

**Step 4: Revisar visualmente en desarrollo**

Aplicar `@ui-visual-validator`. Levantar cada `pnpm dev:<portal>` de forma individual, inspeccionar portada, navegación, página de contenido, móvil y modo oscuro. Esto no ejecuta un build.

**Step 5: Registrar limitaciones**

El informe debe indicar explícitamente:

- builds no ejecutados por restricción del proyecto;
- búsqueda Pagefind pendiente de comprobar en artefactos de producción;
- Cloudflare Access pendiente de validación contra dominios reales;
- número de páginas migradas, en revisión y todavía faltantes.

**Step 6: Commit**

```bash
git add docs/migration
git commit -m "docs: record astro migration verification"
```

## Resultado esperado

Al completar el plan, `sacdia-docs` contendrá tres portales estáticos separados por audiencia, una sola identidad visual, contenido técnico migrado, inventarios verificables para los manuales faltantes y runbooks de publicación privada. La validación de build y del perímetro real de Cloudflare seguirá pendiente hasta recibir autorización y credenciales externas.
