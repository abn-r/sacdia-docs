import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  output: 'static',
  site: process.env.PUBLIC_TECNICO_URL ?? 'http://localhost:4323',
  integrations: [
    starlight({
      title: 'SACDIA — Documentación técnica',
      description: 'Referencia privada de API, arquitectura, datos, seguridad y estándares.',
      locales: {
        root: { label: 'Español', lang: 'es' },
      },
      pagefind: true,
      lastUpdated: true,
      favicon: '/favicon.svg',
      head: [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex,nofollow' } }],
      customCss: ['@sacdia/docs-ui/styles/starlight.css', './src/styles/custom.css'],
      components: {
        SiteTitle: './src/components/SiteTitle.astro',
      },
      sidebar: [
        { label: 'API', items: [{ autogenerate: { directory: 'api' } }] },
        { label: 'Arquitectura', items: [{ autogenerate: { directory: 'arquitectura' } }] },
        { label: 'Base de datos', items: [{ autogenerate: { directory: 'base-de-datos' } }] },
        { label: 'Producto', items: [{ autogenerate: { directory: 'producto' } }] },
        { label: 'Seguridad', items: [{ autogenerate: { directory: 'seguridad' } }] },
        { label: 'Integración', items: [{ autogenerate: { directory: 'integracion' } }] },
        { label: 'Frontend', items: [{ autogenerate: { directory: 'frontend' } }] },
        { label: 'Estándares', items: [{ autogenerate: { directory: 'estandares' } }] },
        { label: 'Pruebas', items: [{ autogenerate: { directory: 'testing' } }] },
        { label: 'Guías', items: [{ autogenerate: { directory: 'guias' } }] },
        { label: 'Referencia', items: [{ autogenerate: { directory: 'referencia' } }] },
      ],
    }),
  ],
});
