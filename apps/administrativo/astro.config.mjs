import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  output: 'static',
  site: process.env.PRIVATE_ADMINISTRATIVO_URL ?? 'http://localhost:4322',
  integrations: [
    starlight({
      title: 'SACDIA — Manual administrativo',
      description: 'Guías privadas para operar el panel administrativo de SACDIA.',
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
        { label: 'Primeros pasos', items: [{ autogenerate: { directory: 'primeros-pasos' } }] },
        { label: 'Clubes', items: [{ autogenerate: { directory: 'clubes' } }] },
        { label: 'Finanzas', items: [{ autogenerate: { directory: 'finanzas' } }] },
        { label: 'Materiales', items: [{ autogenerate: { directory: 'materiales' } }] },
        { label: 'Investiduras', items: [{ autogenerate: { directory: 'investiduras' } }] },
        { label: 'Configuración', items: [{ autogenerate: { directory: 'configuracion' } }] },
        { label: 'Procesos', items: [{ autogenerate: { directory: 'procesos' } }] },
      ],
    }),
  ],
});
