# Despliegue en Cloudflare Pages

SACDIA usa un proyecto de Cloudflare Pages por portal. Los comandos de build de esta guía son configuración para Cloudflare; **no se ejecutaron durante la migración local**.

## Configuración compartida

- Repositorio: `sacdia-docs`.
- Rama de producción: `development`.
- Directorio raíz: raíz del repositorio.
- Node.js: 22.
- pnpm: 10.29.3.
- Comando de instalación: `pnpm install --frozen-lockfile`.
- Las variables `PUBLIC_*_URL` contienen la URL canónica, no secretos.

## Proyectos

| Proyecto sugerido | Paquete | Comando de build | Directorio de salida | Variable canónica | Acceso |
| --- | --- | --- | --- | --- | --- |
| `sacdia-docs-operativo` | `@sacdia/docs-operativo` | `pnpm --filter @sacdia/docs-operativo build` | `apps/operativo/dist` | `PUBLIC_OPERATIVO_URL` | Público |
| `sacdia-docs-administrativo` | `@sacdia/docs-administrativo` | `pnpm --filter @sacdia/docs-administrativo build` | `apps/administrativo/dist` | `PUBLIC_ADMINISTRATIVO_URL` | Cloudflare Access |
| `sacdia-docs-tecnico` | `@sacdia/docs-tecnico` | `pnpm --filter @sacdia/docs-tecnico build` | `apps/tecnico/dist` | `PUBLIC_TECNICO_URL` | Cloudflare Access |

## Rutas observadas por proyecto

Para evitar despliegues innecesarios, cada proyecto debe observar:

- su propia carpeta `apps/<portal>/**`;
- `packages/**`;
- `package.json`, `pnpm-lock.yaml` y `pnpm-workspace.yaml`;
- `.pages.yml` cuando el cambio editorial afecte al portal.

El portal técnico también observa `scripts/sync-*.ts` y los artefactos generados dentro de `apps/tecnico/src/content/docs`.

## Alta de un proyecto

1. Conecta el repositorio a Pages.
2. Configura el paquete, comando y salida de la tabla.
3. Define la variable canónica con el dominio HTTPS definitivo.
4. Añade el dominio personalizado.
5. Para los portales privados, completa **antes de compartir la URL** el runbook de [Cloudflare Access](./cloudflare-access.md).
6. Ejecuta el [checklist de revisión](./access-review-checklist.md).

Cloudflare Pages requiere que el comando escriba en el directorio de salida configurado. La referencia oficial se mantiene en [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/).
