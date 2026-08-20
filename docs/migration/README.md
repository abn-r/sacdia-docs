# Migración de contenido

Esta carpeta registra la transición desde la aplicación Fumadocs hacia los tres portales Astro/Starlight.

## Inventario inicial

`content-inventory.csv` conserva la ruta de origen, el destino propuesto, el riesgo MDX y el estado editorial de las 98 páginas heredadas.

- El inventario **no** convierte automáticamente ninguna página en manual operativo.
- Las páginas existentes se tratan como documentación técnica hasta que una revisión editorial demuestre otro alcance.
- `mdx_risk=high` obliga a validar la página con Astro antes de publicarla.
- Los archivos generados deben mantenerse mediante sus scripts, no desde el editor visual.

El inventario es evidencia de migración, no una fuente de autorización ni una garantía de que el contenido siga vigente.
