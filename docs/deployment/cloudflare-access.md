# Protección con Cloudflare Access

Este runbook aplica únicamente a los portales **administrativo** y **técnico**. `noindex`, `robots.txt` y las cabeceras HTTP no autorizan usuarios: Cloudflare Access es la barrera real.

## Audiencias del MVP

| Portal | Lista de Access | Criterio inicial |
| --- | --- | --- |
| Administrativo | `sacdia-docs-administrativo` | Personas con acceso vigente al panel SACDIA |
| Técnico | `sacdia-docs-tecnico` | Personas con rol `admin` o `super_admin` |

Las listas son manuales durante el MVP. Cloudflare Access no interpreta automáticamente los grants de SACDIA.

## Configuración por portal privado

1. Habilita One-time PIN como método de identidad.
2. Crea la lista explícita de correos correspondiente.
3. Crea una aplicación Access self-hosted para el dominio personalizado.
4. Protege también el dominio raíz `<proyecto>.pages.dev`.
5. Protege `*.<proyecto>.pages.dev` para cubrir URLs hash y alias de previews.
6. Activa además **Enable access policy** en Pages → Settings → General para los previews.
7. Configura una política Allow que solo incluya la lista del portal. No uses `Everyone`, bypass ni dominios de correo amplios.
8. Deja sin coincidencia a cualquier identidad no incluida: el resultado debe ser denegado por defecto.
9. Reduce la duración de sesión según la política del equipo y registra responsable/fecha de revisión.

Cloudflare documenta que los previews de Pages son públicos por defecto y que el interruptor de previews no protege por sí solo el dominio raíz `pages.dev` ni el dominio personalizado. Por eso los tres alcances deben revisarse de forma independiente: [Preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) y [Self-hosted applications](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-public-app/).

## Prueba obligatoria

Realiza las pruebas en una sesión anónima y luego con una cuenta permitida.

### Anónimo o correo no permitido

- El HTML del portal no se entrega.
- `/favicon.svg` y cualquier archivo bajo `/media/` no se entregan directamente.
- Los archivos de Pagefind no se entregan.
- Se recibe la pantalla de Access o una respuesta de denegación.

### Correo permitido

- One-time PIN llega únicamente si la política permite el correo.
- El portal, sus assets y la búsqueda se cargan después de autenticar.
- El portal administrativo no concede acceso automático al técnico.

La referencia oficial de OTP indica que el correo debe estar autorizado por una política y que el PIN expira: [One-time PIN login](https://developers.cloudflare.com/cloudflare-one/identity/one-time-pin/).

## Altas, bajas y cambios de cargo

- Un alta al panel genera una tarea separada para evaluar la lista administrativa.
- Una baja del panel elimina el correo de la lista administrativa el mismo día.
- Asignar o retirar `admin`/`super_admin` genera la actualización equivalente en la lista técnica.
- Cada cambio debe registrar solicitante, aprobador, lista afectada y fecha.
- La revisión trimestral compara las listas de Access contra las cuentas y cargos vigentes de SACDIA.
