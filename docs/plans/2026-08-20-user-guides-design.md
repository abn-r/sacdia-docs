# Diseño de las guías de uso de SACDIA

## Objetivo

Convertir el inventario de 170 superficies reales en manuales utilizables para la aplicación móvil y el panel administrativo, sin inventar pantallas ni duplicar una guía por cada ruta técnica.

## Decisión editorial

- Cada **módulo funcional** tendrá un manual de pantalla que agrupa sus vistas de lista, detalle, alta y edición.
- Cada **proceso continuo** tendrá una guía independiente cuando cambie de participante o atraviese la aplicación y el panel.
- Las rutas que solamente redirigen se documentarán dentro de su destino canónico.
- Las superficies todavía no operativas se identificarán explícitamente; no se describirán acciones inexistentes.
- La visibilidad de acciones se explicará mediante cargos y permisos. La autorización efectiva continúa perteneciendo al sistema, no al sitio documental.

## Fuentes de verificación

1. Matriz `docs/migration/surface-coverage.csv`.
2. Rutas y componentes efectivos de `sacdia-admin/src/app`.
3. Router, vistas y providers efectivos de `sacdia-app/lib`.
4. Canon de dominio y documentos `docs/features` del workspace SACDIA.
5. Contrato runtime `docs/api/ENDPOINTS-LIVE-REFERENCE.md` cuando una acción dependa de estados o permisos backend.

## Estructura de cada manual

1. Resultado que obtiene la persona.
2. Quién puede usar la función.
3. Pantallas o rutas incluidas.
4. Requisitos previos.
5. Acciones principales en orden observable.
6. Confirmación del resultado.
7. Errores frecuentes y recuperación.
8. Enlaces a procesos relacionados.

## Cobertura

- **Operativo**: manuales para las 37 features móviles inventariadas, permitiendo que dos features compartan manual cuando representan la misma experiencia visible.
- **Administrativo**: manuales para los 32 módulos de rutas, agrupando altas, ediciones, detalles y alias dentro de una sola guía funcional.
- **Procesos**: registro y membresía, traslados, actividades, finanzas, seguros y órdenes de pago, materiales, carpetas de evidencias, investiduras, certificados, camporees, reportes y comunicaciones.

## Criterios de publicación

- No quedan páginas de categoría con texto de relleno.
- Cada fila de cobertura enlaza un manual existente.
- Cada manual declara la fecha y la fuente de revisión.
- Los chequeos de contenido y enlaces se ejecutan sin compilar los portales.
