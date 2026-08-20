# Capturas reales para los manuales prioritarios

## Objetivo

Incorporar evidencia visual real de SACDIA en los manuales de Finanzas,
Materiales y Membresía, tanto para la aplicación como para el panel
administrativo, sin exponer credenciales ni información sensible.

## Alcance aprobado

| Dominio | Aplicación | Panel administrativo |
| --- | --- | --- |
| Finanzas | `pantallas/finanzas.mdx` | `finanzas/finanzas-clubes.mdx` |
| Materiales | `pantallas/materiales.mdx` | `materiales/solicitudes-materiales.mdx` |
| Membresía | `pantallas/miembros.mdx` | `clubes/solicitudes.mdx` |

Cada manual recibirá al menos una captura de su vista principal. Se podrán
incluir capturas adicionales únicamente cuando expliquen una decisión o paso
que no sea evidente en la vista general.

## Decisiones de diseño

### Fuente y privacidad

- Las imágenes deben provenir del runtime real de SACDIA.
- Solo se usarán cuentas, clubes y registros de prueba.
- No se capturarán contraseñas, tokens, correos personales, datos médicos ni
  comprobantes con información privada.
- Si una pantalla no puede capturarse sin exponer información, se omite; no se
  inventa ni se altera mediante generación de imágenes.

### Almacenamiento

- Aplicación: `apps/operativo/public/media/guides/<dominio>/`.
- Panel: `apps/administrativo/public/media/guides/<dominio>/`.
- Nombres descriptivos en kebab-case, sin fechas ni identificadores de usuario.
- PNG para conservar nitidez en textos y controles pequeños.

### Presentación

Un componente compartido `GuideScreenshot.astro` mostrará cada captura con:

- texto alternativo obligatorio;
- pie de imagen visible;
- variante `mobile` o `desktop`;
- carga diferida y decodificación asíncrona;
- borde, fondo y tamaño máximo consistentes con los tres temas visuales.

Las capturas se insertarán junto al paso o explicación que ayudan a reconocer,
no como una galería separada al final del manual.

## Verificación

- Prueba de contrato del componente y de sus atributos accesibles.
- Prueba de contenido que compruebe que cada ruta `/media/...` referenciada
  existe en el portal correcto.
- `pnpm test` y `pnpm check` sin ejecutar builds.
- Revisión visual en escritorio y móvil de al menos un manual de cada portal.

## Fuera de alcance

- Capturar las 68 guías en esta primera iteración.
- Automatizar la regeneración de capturas en CI.
- Publicar los portales o configurar Cloudflare Access.
- Modificar datos reales para preparar una imagen.
