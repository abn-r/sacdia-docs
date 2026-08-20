# Checklist de revisión de acceso

Completar por separado para `sacdia-docs-administrativo` y `sacdia-docs-tecnico`.

## Cobertura de hostnames

- [ ] El dominio personalizado está detrás de Access.
- [ ] El dominio raíz `<proyecto>.pages.dev` está detrás de Access.
- [ ] Los previews `*.<proyecto>.pages.dev` están protegidos.
- [ ] **Enable access policy** está activo en la configuración de previews de Pages.

## Política

- [ ] One-time PIN está habilitado.
- [ ] La política Allow usa una lista explícita de correos.
- [ ] No existe regla `Everyone`, bypass ni dominio de correo amplio.
- [ ] Una identidad que no coincide con la lista queda denegada por defecto.
- [ ] La lista administrativa corresponde a usuarios vigentes del panel.
- [ ] La lista técnica corresponde solamente a `admin` y `super_admin`.

## Defensa contra indexación

- [ ] La respuesta incluye `X-Robots-Tag: noindex, nofollow`.
- [ ] `/robots.txt` contiene `Disallow: /`.
- [ ] El HTML incluye `<meta name="robots" content="noindex,nofollow">`.

## Pruebas anónimas

- [ ] El dominio personalizado no entrega HTML sin autenticar.
- [ ] El dominio `pages.dev` no entrega HTML sin autenticar.
- [ ] Un preview no entrega HTML sin autenticar.
- [ ] Assets, medios y favicon no son accesibles sin autenticar.
- [ ] El índice y los fragmentos de Pagefind no son accesibles sin autenticar.

## Evidencia

- [ ] Fecha, revisor y resultado quedaron registrados.
- [ ] Se adjuntaron respuestas HTTP o capturas sin información sensible.
- [ ] Toda excepción tiene responsable, justificación y fecha de vencimiento.
