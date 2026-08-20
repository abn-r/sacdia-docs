import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  output: 'static',
  site: process.env.PUBLIC_OPERATIVO_URL ?? 'http://localhost:4321',
  integrations: [
    starlight({
      title: 'SACDIA — Manual operativo',
      description: 'Guías para utilizar la aplicación y completar tareas cotidianas.',
      locales: {
        root: { label: 'Español', lang: 'es' },
      },
      pagefind: true,
      lastUpdated: true,
      favicon: '/favicon.svg',
      customCss: ['@sacdia/docs-ui/styles/starlight.css', './src/styles/custom.css'],
      components: {
        SiteTitle: './src/components/SiteTitle.astro',
      },
      sidebar: [
        { label: 'Primeros pasos', items: [{ autogenerate: { directory: 'primeros-pasos' } }] },
        { label: 'Pantallas', items: [{ autogenerate: { directory: 'pantallas' } }] },
        { label: 'Procesos', items: [{ autogenerate: { directory: 'procesos' } }] },
        { label: 'Ayuda', items: [{ autogenerate: { directory: 'ayuda' } }] },
      ],
    }),
  ],
});
