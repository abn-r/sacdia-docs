# Guide Screenshot Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add accessible, real SACDIA screenshots to six priority manuals covering Finanzas, Materiales and Membresía in the app and administrative panel.

**Architecture:** A shared Astro component owns image semantics and responsive presentation. Screenshots live in each portal's existing Pages CMS media root, while automated tests verify that every referenced image exists in the correct portal. Runtime capture uses MobAI for Flutter and Playwright for the administrative web panel.

**Tech Stack:** Astro 7, Starlight, MDX, Vitest, MobAI, Playwright CLI, PNG.

---

### Task 1: Add the accessible screenshot component

**Files:**
- Create: `packages/ui/src/components/GuideScreenshot.astro`
- Modify: `packages/ui/src/styles/starlight.css`
- Modify: `packages/ui/tests/a11y-contract.test.ts`

**Step 1: Write the failing contract test**

Require the component to expose mandatory `src`, `alt` and `caption` props,
render a `figure`, use `loading="lazy"`, and connect the image to its caption.

**Step 2: Run the test to verify it fails**

Run: `pnpm test -- packages/ui/tests/a11y-contract.test.ts`

Expected: FAIL because `GuideScreenshot.astro` does not exist.

**Step 3: Implement the component and responsive styles**

Support `kind="mobile" | "desktop"`, generate a stable caption id and keep
portrait captures narrow without reducing desktop captures below readable size.

**Step 4: Run the test to verify it passes**

Run: `pnpm test -- packages/ui/tests/a11y-contract.test.ts`

Expected: PASS.

### Task 2: Add the media-reference contract

**Files:**
- Create: `tests/manual-media.test.ts`

**Step 1: Write the failing test**

Define the six approved manuals and image paths. Require every manual to import
`GuideScreenshot`, reference the expected `/media/guides/...` image and resolve
that URL under its portal's `public` directory.

**Step 2: Run the test to verify it fails**

Run: `pnpm test -- tests/manual-media.test.ts`

Expected: FAIL because the screenshots and MDX references do not exist.

### Task 3: Capture the three application views

**Files:**
- Create: `apps/operativo/public/media/guides/finanzas/resumen-financiero.png`
- Create: `apps/operativo/public/media/guides/materiales/catalogo-materiales.png`
- Create: `apps/operativo/public/media/guides/membresia/miembros-del-club.png`

**Step 1: Discover and start the mobile device**

Use MobAI `list_devices`, `start_bridge` and `execute_dsl`. Observe the current
screen before acting and use predicates instead of coordinates.

**Step 2: Navigate with a QA account**

Capture only settled screens containing test data. Reject any frame that exposes
credentials, personal email, health data or private attachments.

**Step 3: Save full-quality screenshots**

Use MobAI `save_screenshot` with the exact paths above.

### Task 4: Capture the three administrative views

**Files:**
- Create: `apps/administrativo/public/media/guides/finanzas/movimientos-por-club.png`
- Create: `apps/administrativo/public/media/guides/materiales/solicitudes-materiales.png`
- Create: `apps/administrativo/public/media/guides/membresia/solicitudes-membresia.png`

**Step 1: Open the effective admin runtime**

Use Playwright CLI with the existing QA session or stored test credentials. Do
not expose credentials in commands, logs or committed assets.

**Step 2: Navigate to each module**

Use fresh accessibility snapshots before clicks, wait for the page to settle and
capture at 1440 × 1000.

**Step 3: Review each PNG**

Reject screenshots containing private emails, tokens, medical data, real
attachments or transient loading/error states.

### Task 5: Integrate the six captures into the manuals

**Files:**
- Modify: `apps/operativo/src/content/docs/pantallas/finanzas.mdx`
- Modify: `apps/operativo/src/content/docs/pantallas/materiales.mdx`
- Modify: `apps/operativo/src/content/docs/pantallas/miembros.mdx`
- Modify: `apps/administrativo/src/content/docs/finanzas/finanzas-clubes.mdx`
- Modify: `apps/administrativo/src/content/docs/materiales/solicitudes-materiales.mdx`
- Modify: `apps/administrativo/src/content/docs/clubes/solicitudes.mdx`

**Step 1: Import the component**

Import `GuideScreenshot` from `@sacdia/docs-ui/components/GuideScreenshot`.

**Step 2: Place each image near the recognition step**

Use precise alternative text and a caption that explains what the reader should
confirm, without repeating the surrounding paragraph verbatim.

**Step 3: Run the media contract**

Run: `pnpm test -- tests/manual-media.test.ts`

Expected: PASS.

### Task 6: Verify content and presentation

**Files:**
- Modify: `docs/migration/verification-report.md`

**Step 1: Run automated verification**

Run: `pnpm test`

Expected: all tests pass.

Run: `pnpm check`

Expected: 0 errors, warnings and hints in all three portals.

Run: `git diff --check`

Expected: no whitespace errors.

**Step 2: Review one manual per portal**

Use Astro dev plus Playwright at desktop and mobile widths. Confirm captions,
alternative-text semantics, no overflow and no console errors.

**Step 3: Record evidence and commit**

Update the migration verification report with the exact screens captured and
the privacy review result. Commit with a conventional `docs:` message. Do not
run builds.
