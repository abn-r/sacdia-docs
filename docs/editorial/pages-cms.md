# Edición visual con Pages CMS

Pages CMS ofrece una interfaz visual sobre los archivos MDX del repositorio. Git continúa siendo la fuente de verdad: cada edición crea un commit y pasa por las mismas validaciones que una modificación técnica.

## Alcance del MVP

Solo autores de confianza recibirán acceso al repositorio y a Pages CMS. La configuración separa:

- manual operativo;
- manual administrativo;
- documentación técnica;
- archivos multimedia de cada portal.

Pages CMS no sustituye los permisos de GitHub, la revisión de cambios ni Cloudflare Access. El acceso a un portal publicado tampoco concede permiso para editarlo.

## Flujo editorial

1. El autor elige la colección correspondiente a su audiencia.
2. Crea o modifica un documento con estado `draft`.
3. Completa responsable y fecha de revisión.
4. Verifica el contenido contra la pantalla, proceso o contrato real.
5. Solicita revisión mediante el flujo normal de Git.
6. Cambia a `published` únicamente después de la aprobación.

La opción `settings.content.merge: true` conserva frontmatter que el formulario no administra. Los archivos `_generated-*` y `api/endpoints.mdx` quedan fuera del editor: se actualizan con `pnpm sync:all`.

## Medios

Cada colección usa su propio origen bajo `apps/<portal>/public/media`. No se deben enlazar archivos privados desde el portal público ni compartir URLs de un portal privado como si fueran una barrera de autorización.

## Referencias de configuración

- [Configuración de Pages CMS](https://pagescms.org/docs/configuration/)
- [Colecciones y exclusiones](https://pagescms.org/docs/configuration/content/)
- [Medios](https://pagescms.org/docs/configuration/media/)
- [Editor rich-text](https://pagescms.org/docs/configuration/fields/rich-text/)
- [Settings y commits](https://pagescms.org/docs/configuration/settings/)
