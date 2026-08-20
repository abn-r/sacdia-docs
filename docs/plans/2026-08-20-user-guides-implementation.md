# SACDIA User Guides Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publicar manuales verificables para todas las superficies inventariadas de la aplicación y el panel administrativo de SACDIA.

**Architecture:** Los manuales se organizan por módulo funcional y los recorridos que cambian de participante se documentan como procesos cross-surface. La matriz CSV funciona como contrato de cobertura y enlaza cada superficie con un archivo MDX real.

**Tech Stack:** Astro, Starlight, MDX, TypeScript, Vitest y CSV.

---

### Task 1: Proteger el contrato de cobertura

**Files:**
- Create: `tests/manual-coverage.test.ts`
- Modify: `docs/migration/surface-coverage.csv`

**Steps:**
1. Escribir pruebas que fallen cuando una superficie siga `missing`, apunte a una ruta inexistente o carezca de proceso cuando corresponda.
2. Ejecutar `pnpm test -- tests/manual-coverage.test.ts` y confirmar el fallo inicial.
3. Mantener la prueba durante toda la producción editorial.

### Task 2: Generar los manuales operativos

**Files:**
- Modify: `apps/operativo/src/content/docs/pantallas/index.mdx`
- Create: `apps/operativo/src/content/docs/pantallas/*.mdx`
- Modify: `apps/operativo/src/content/docs/primeros-pasos/index.mdx`
- Modify: `apps/operativo/src/content/docs/ayuda/index.mdx`

**Steps:**
1. Crear un manual por módulo o experiencia visible.
2. Documentar requisitos, acciones, verificación y recuperación.
3. Enlazar cada feature móvil desde el índice de pantallas.

### Task 3: Generar los manuales administrativos

**Files:**
- Modify: `apps/administrativo/src/content/docs/*/index.mdx`
- Create: `apps/administrativo/src/content/docs/{clubes,finanzas,materiales,investiduras,configuracion}/*.mdx`

**Steps:**
1. Agrupar rutas de lista, alta, edición y detalle por módulo.
2. Declarar permisos y cambios de alcance territorial cuando sean visibles.
3. Identificar alias, redirecciones y superficies sin operación independiente.

### Task 4: Documentar procesos continuos

**Files:**
- Modify: `apps/operativo/src/content/docs/procesos/index.mdx`
- Modify: `apps/administrativo/src/content/docs/procesos/index.mdx`
- Create: `apps/operativo/src/content/docs/procesos/*.mdx`
- Create: `apps/administrativo/src/content/docs/procesos/*.mdx`

**Steps:**
1. Documentar el inicio en la aplicación.
2. Señalar el cambio de responsable y la continuación en el panel.
3. Definir estados finales verificables y cómo retomar errores sin duplicar operaciones.

### Task 5: Cerrar la matriz y validar

**Files:**
- Modify: `docs/migration/surface-coverage.csv`
- Modify: `docs/migration/verification-report.md`

**Steps:**
1. Mapear las 170 superficies a manuales existentes.
2. Ejecutar `pnpm test`.
3. Ejecutar `pnpm check:operativo` y `pnpm check:administrativo`.
4. Ejecutar `git diff --check`.
5. No ejecutar `pnpm build` ni comandos equivalentes.
