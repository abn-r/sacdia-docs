# Informe de verificación de la migración Astro

**Fecha:** 2026-08-21

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
| `pnpm test` | 16 archivos, 68 pruebas aprobadas |
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
98 archivos de guía.

### Refuerzo editorial de formación e investidura

El bloque de formación se amplió con instrucciones operativas verificadas para:

- aplicación: Clases Progresivas, Especialidades y Certificaciones de Guías
  Mayores;
- panel: bandejas de requisitos y cierres de Certificaciones;
- ambos portales: el proceso transversal de formación e investidura.

Los manuales ahora distinguen las tres máquinas de estado, explican quién
realiza cada entrega, separan los modos `IN_APP` y `EXTERNAL` de Especialidades,
documentan el trabajo versionado y el comprobante de cierre de Certificaciones,
y prohíben crear otra inscripción para corregir una devolución.

La prueba `formation-manuals.test.ts` protege las secciones de decisión,
responsabilidades, estados y recuperación de errores. El contenido se contrastó
con el código efectivo de `sacdia-app` y `sacdia-admin`, porque la referencia
canónica heredada de Certificaciones todavía describe como pendiente una parte
del flujo móvil que ya existe en el runtime.

Playwright abrió los seis documentos modificados a 1440 × 1000, con ancho de
documento igual al viewport. Las guías operativa y administrativa de
Certificaciones también se revisaron a 390 × 844: conservaron ancho `390/390`,
tablas de 358 px y consola sin errores ni warnings.

### Refuerzo editorial de actividades y asistencia

El bloque de actividades ahora diferencia consulta, creación, modalidad,
actividad conjunta y asistencia. La guía móvil explica que **Mostrar mi QR**
presenta la identidad del miembro, mientras que **Escanear QR** pertenece al
responsable y registra asistencia únicamente cuando se abre desde una
actividad.

Se creó el manual administrativo `clubes/actividades.mdx` y las dos rutas del
panel se remapearon desde la guía genérica de clubes sin modificar el inventario
de 170 superficies. El nuevo manual cubre filtros territoriales, vistas de mes,
semana y día, creación, detalle y consulta de asistencia.

Los procesos compartidos documentan que una actividad conjunta requiere al
menos dos secciones y que la asistencia se controla una vez por sección. La
prueba `activity-manuals.test.ts` protege estas decisiones y la regla contra
duplicados.

La verificación del runtime también detectó una limitación que los manuales no
ocultan: los listados filtran acciones por permiso, pero los detalles móvil y
administrativo todavía muestran algunas acciones de edición/eliminación sin el
mismo filtro visual. La autorización final continúa en backend.

### Refuerzo editorial de informes mensuales

Los manuales de informes separan datos automáticos y manuales, documentan el
calendario de recordatorios y explican la única secuencia vigente:
`draft` → `generated` → `submitted`. También aclaran que la generación es
asíncrona, que el PDF usa un snapshot congelado y que no debe crearse otro
informe para el mismo enrollment, mes y año.

La guía administrativa corrige un permiso ficticio del texto anterior:
supervisión no usa `reports:supervise`, sino una sesión administrativa acotada
por territorio, junto con `reports:read` y `reports:download`.

El contenido documenta explícitamente la deriva contractual actual del panel:
los nombres del formulario manual no coinciden con el DTO del backend, el
formulario se habilita fuera de `draft`, y Generar/Regenerar esperan un informe
inmediato aunque el backend responde HTTP `202`. Además,
`/reports/monthly-preview` mantiene estado local y no persiste. Por ello, la app
queda como canal vigente de captura y el panel como canal verificado de lista,
supervisión, detalle, envío desde `generated` y descarga.

La prueba `monthly-report-manuals.test.ts` protege estados, responsabilidades,
calendario, limitaciones y recuperación ante una generación encolada.

Playwright abrió los nueve documentos de actividades, QR e informes a
1440 × 1000 y 390 × 844. Todos respondieron HTTP 200, conservaron el ancho del
documento igual al viewport (`1440/1440` y `390/390`), mantuvieron sus tablas en
720 px y 358 px respectivamente, y no emitieron errores ni warnings de consola.

### Refuerzo editorial de acceso y membresía

El recorrido de alta ahora separa cuatro conceptos que el contenido anterior
mezclaba: cuenta, post-registro, inscripción anual y membresía de sección. El
runtime confirmó que el paso 3 crea en una sola transacción tanto la inscripción
anual de la clase derivada como una asignación de miembro en estado `pending`.
Por eso terminar el perfil abre el tablero, pero no habilita todavía las
superficies operativas del club.

La guía móvil documenta el acceso visible con correo y contraseña, el bloqueo
local de 30 segundos después de tres intentos fallidos, los campos reales de
registro y los tres pasos del perfil inicial. También explica la espera de 8
días, los estados `rejected`, `cancelled` y `expired`, y cómo conservar la misma
cuenta al corregir una sección. No presenta Google o Apple como opciones visibles
porque la pantalla actual no incluye esos botones, aunque exista infraestructura
OAuth.

La revisión detectó una limitación adicional del runtime: el alta nueva en
`pending` no tiene `activeAssignmentId`, por lo que el tablero restringido omite
`MembershipStatusBanner` y puede no mostrar **Cancelar solicitud** o **Volver a
solicitar**. Los manuales ya no prometen esas acciones; indican utilizarlas solo
cuando sean visibles y escalar la corrección sin duplicar la cuenta cuando no lo
sean. Por la misma causa, la verificación visual se limita al resultado `active`;
un alta nueva `rejected` o `expired` puede quedar sin banner aunque la autorización
ya haya cambiado.

También se separó el canal de revisión por cargo. Dirección y otros cargos de
club operan desde **Miembros → Solicitudes** en la app cuando sus permisos lo
permiten; la ruta administrativa exige un rol admitido en el panel además de
`club_members:approve` en el alcance. La app usa actualmente
`club_roles:assign` o `club_roles:revoke` como control visual de los botones,
pero el backend exige `club_members:approve`. Dirección recibe ambos; en cambio,
subdirección, secretaría y secretaría-tesorería pueden estar autorizadas por el
backend y aun así no ver los botones móviles. Los manuales registran este falso
negativo y aclaran que un cargo de club no obtiene acceso al panel.

El vencimiento también tiene dos fuentes actuales: el alta fija `expires_at` a
8 días, mientras el proceso horario usa `membership.pending_timeout_days` contra
`created_at`. El valor predeterminado coincide, pero si la configuración cambia,
la fecha visible y el vencimiento automático pueden divergir; la limitación quedó
explícita en los manuales.

Se creó `clubes/solicitudes-membresia.mdx` para la ruta administrativa dedicada
y se separó de las bandejas de cargos y traslados. El manual cubre el selector
de sección, `club_members:approve`, la prioridad visual dentro de 48 horas, la
aprobación inmediata sin diálogo, el rechazo con motivo opcional y el
vencimiento automático. También registra la limitación actual de auditoría:
`modified_at` conserva la hora de la última modificación, pero la asignación no
guarda al actor ni campos semánticos `approved_at` o `rejected_at`.

La cobertura mantiene las 170 superficies y remapea únicamente
`/dashboard/requests/membership` al manual nuevo. La prueba
`access-membership-manuals.test.ts` protege la separación, los estados, las
responsabilidades y la regla de no duplicar cuentas. El registro de medios se
actualizó para asociar la captura existente con la guía dedicada.

Playwright abrió las siete páginas principales afectadas a 1440 × 1000 y 390 × 844. Todas
mostraron el título y la sección esperados, conservaron el ancho del documento
igual al viewport (`1440/1440` y `390/390`) y no emitieron errores ni warnings de
consola. Las capturas de miembros y de solicitudes administrativas cargaron
completas, con anchos naturales de 1206 px y 1120 px respectivamente.

### Capturas reales en manuales prioritarios

Se integraron doce capturas del runtime efectivo en guías prioritarias:

- aplicación Flutter: resumen financiero, acceso rápido a Inventario/Pedidos y
  solicitudes de miembros; centro de Ayuda y soporte, biblioteca de Recursos y
  catálogo personal de Logros;
- panel administrativo: Finanzas por club, solicitudes de materiales y
  solicitudes de membresía; plantillas de eventos para camporees, filtros de
  Recursos y configuración de Logros.

Las seis capturas móviles se obtuvieron con MobAI. Las seis administrativas se
obtuvieron con Playwright y se recortaron al contenido funcional para excluir
barra lateral, perfil y correo. La captura financiera utiliza exclusivamente
datos QA cuya publicación privada fue autorizada: balance `$2,079`, ingresos
`$100`, egresos `$300` y una transacción. Ninguna imagen incluye credenciales,
tokens, datos médicos, correos personales ni adjuntos privados.

El catálogo móvil de Materiales no se publicó porque el runtime QA mostraba las
claves sin traducir `materials.catalog.*`. La guía usa en su lugar la vista real
de acceso rápido a **Inventario** y **Pedidos**, y el defecto de localización
quedó registrado para corrección en la aplicación.

La lista móvil de Camporees tampoco se publicó: el runtime mostraba una
organización y ubicación que no estaban autorizadas para este conjunto de
medios. El bloque se completó con una captura segura de **Ayuda y soporte**; la
guía administrativa de Camporees usa el estado vacío de la biblioteca de
plantillas, sin información territorial.

La prueba `manual-media.test.ts` valida la conexión de cada captura con su
manual, su resolución dentro del portal correcto, la firma PNG y un tamaño
mínimo. Playwright confirmó ambos bloques de seis imágenes a 1440 × 1000, los
dos portales a 390 × 844 sin overflow (`390/390`), pies de imagen visibles y
consola sin errores.

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
| Manuales administrativos | 33 archivos para 34 módulos |
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
