import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'SACDIA Docs',
    },
    githubUrl: 'https://github.com/abn-r/sacdia-docs',
    links: [
      { text: 'Documentaci\u00f3n', url: '/docs' },
      { text: 'Desarrollo', url: '/dev' },
    ],
  };
}
