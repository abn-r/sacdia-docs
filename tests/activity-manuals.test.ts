import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface ManualContract {
  path: string;
  markers: string[];
}

const manuals: ManualContract[] = [
  {
    path: 'apps/operativo/src/content/docs/pantallas/actividades.mdx',
    markers: [
      '## Elegir modalidad',
      '## Crear una actividad conjunta',
      '## Registrar asistencia',
      '`activities:create`',
      '`attendance:manage`',
      '**Mostrar mi QR**',
    ],
  },
  {
    path: 'apps/operativo/src/content/docs/pantallas/escaner-qr.mdx',
    markers: [
      '## Antes de escanear',
      '## Interpretar el resultado',
      'ya registrada',
      'No compartas',
      '**Mostrar mi QR**',
    ],
  },
  {
    path: 'apps/administrativo/src/content/docs/clubes/actividades.mdx',
    markers: [
      '## Elegir calendario o lista',
      '## Consultar la asistencia',
      '`activities:read`',
      '`activities:create`',
      '`activities:update`',
      '`activities:delete`',
      'autorización final',
    ],
  },
  ...['operativo', 'administrativo'].map((portal) => ({
    path: `apps/${portal}/src/content/docs/procesos/actividad-y-asistencia.mdx`,
    markers: [
      '## No confundas mostrar y escanear',
      '## Matriz de responsabilidades',
      'una vez por sección',
      'No crees otra actividad',
      '**Mostrar mi QR**',
    ],
  })),
];

describe('activity and attendance manuals', () => {
  it.each(manuals)('keeps $path operationally complete', ({ path, markers }) => {
    const source = readFileSync(path, 'utf8');
    const missing = markers.filter((marker) => !source.includes(marker));

    expect(missing, `${path} is missing:\n${missing.join('\n')}`).toEqual([]);
  });
});
