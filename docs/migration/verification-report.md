# Informe de verificación de la migración Astro

**Fecha:** 2026-08-20

**Rama:** `codex/astro-documentation-portals`

## Resultado

La aplicación Fumadocs/Next fue reemplazada por tres portales Astro/Starlight independientes:

- operativo público;
- administrativo privado;
- técnico privado.

Los tres comparten identidad visual, configuración tipada, schema editorial y navegación entre portales.

## Verificación automatizada

| Validación | Resultado |
| --- | --- |
| `pnpm test` | 12 archivos, 46 pruebas aprobadas |
| `pnpm check` | 3 portales, 0 errores, 0 warnings y 0 hints |
| `git diff --check development...HEAD` | Sin errores de whitespace |
| Schema de contenido | Las 102 entradas actuales del portal técnico sincronizan correctamente |
| Generadores técnicos | Endpoints, Prisma y versiones escriben en el portal técnico de forma atómica |

No se ejecutó ningún build.

## Verificación en servidor de desarrollo

Los tres portales respondieron correctamente en sus puertos asignados:

- `http://localhost:4321` — operativo;
- `http://localhost:4322` — administrativo;
- `http://localhost:4323` — técnico.

También se abrieron las cuatro páginas marcadas con riesgo MDX alto y la referencia generada de endpoints. Todas renderizaron sin error runtime.

La revisión en navegador detectó y corrigió un error real que `astro check` no reportaba: los imports MDX agregaban `.astro` a un export de paquete que ya añadía esa extensión.

## Verificación visual

De la evidencia visual se observó:

- portadas de los tres portales a 1440 × 1000;
- portal operativo a 390 × 844 sin overflow horizontal;
- modo oscuro operativo con jerarquía y acentos conservados;
- navegación de contenido con sidebar y tabla de contenidos;
- skip link visible con foco de teclado;
- selector de portal, búsqueda y tema presentes en escritorio;
- acentos Mint, Ember y Navy diferenciados por audiencia.

La barra flotante oscura de algunas capturas pertenece al toolbar de desarrollo de Astro y no al diseño del portal. No se ejecutó una auditoría WCAG automatizada ni comparación cross-browser de producción.

### Guías operativas y administrativas

Después de producir los manuales se revisaron directamente en navegador las
guías **Finanzas del club**, **Finanzas de clubes**, **Solicitar, pagar y recibir
materiales** y **Registrar y supervisar finanzas**.

- escritorio a 1440 × 1000 en ambos portales;
- móvil a 390 × 844 en ambos portales;
- modo oscuro del portal operativo;
- menú móvil y selector de tema;
- foco visible del enlace **Ir al contenido**;
- ancho de documento igual al viewport (`390/390`), sin overflow horizontal;
- consola sin errores ni warnings en las páginas revisadas.

Esta comprobación valida la presentación y navegación de muestras
representativas; no sustituye una revisión editorial humana de cada uno de los
96 archivos de guía.

### Capturas reales en manuales prioritarios

Se integraron seis capturas del runtime efectivo en las guías de Finanzas,
Materiales y Membresía:

- aplicación Flutter: resumen financiero, acceso rápido a Inventario/Pedidos y
  solicitudes de miembros;
- panel administrativo: Finanzas por club, solicitudes de materiales y
  solicitudes de membresía.

Las tres capturas móviles se obtuvieron con MobAI. Las tres administrativas se
obtuvieron con Playwright y se recortaron al contenido funcional para excluir
barra lateral, perfil y correo. La captura financiera utiliza exclusivamente
datos QA cuya publicación privada fue autorizada: balance `$2,079`, ingresos
`$100`, egresos `$300` y una transacción. Ninguna imagen incluye credenciales,
tokens, datos médicos, correos personales ni adjuntos privados.

El catálogo móvil de Materiales no se publicó porque el runtime QA mostraba las
claves sin traducir `materials.catalog.*`. La guía usa en su lugar la vista real
de acceso rápido a **Inventario** y **Pedidos**, y el defecto de localización
quedó registrado para corrección en la aplicación.

La prueba `manual-media.test.ts` valida la conexión de cada captura con su
manual, su resolución dentro del portal correcto, la firma PNG y un tamaño
mínimo. Playwright confirmó las seis imágenes a 1440 × 1000, los dos portales a
390 × 844 sin overflow (`390/390`), pies de imagen visibles y consola sin
errores.

## Cobertura de contenido

| Métrica | Cantidad |
| --- | ---: |
| Páginas heredadas inventariadas y migradas | 98 |
| Páginas listas según reglas automáticas | 93 |
| Páginas que requieren revisión editorial/MDX | 5 |
| Archivos generados | 3 |
| Rutas administrativas cubiertas | 133 de 133 |
| Features móviles cubiertas | 37 de 37 |
| Superficies cubiertas totales | 170 de 170 |
| Manuales operativos de pantalla | 37 |
| Manuales administrativos | 31 archivos para 32 módulos |
| Procesos transversales | 14, disponibles en ambos portales |

Los manuales se agrupan por recorrido funcional, pero cada superficie conserva su
trazabilidad en `surface-coverage.csv`. La prueba `manual-coverage.test.ts` exige
que las 170 filas permanezcan cubiertas, que sus archivos existan y que los
enlaces internos de ambos portales resuelvan a contenido real.

## Limitaciones pendientes

- **Builds no ejecutados:** restricción expresa del proyecto.
- **Pagefind:** pendiente validar su índice y búsqueda en artefactos de producción.
- **Cloudflare Pages:** pendientes crear y configurar los tres proyectos reales.
- **Cloudflare Access:** pendientes validar custom domains, dominios raíz `pages.dev`, previews, OTP y listas reales.
- **Redirecciones:** `redirects.csv` documenta 98 equivalencias; todavía deben aplicarse en el hosting si se conservan las URLs anteriores.
- **Revisión editorial:** cinco páginas permanecen en estado de revisión.
