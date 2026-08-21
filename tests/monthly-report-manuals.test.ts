import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface ManualContract {
  path: string;
  markers: string[];
}

const manuals: ManualContract[] = [
  {
    path: 'apps/operativo/src/content/docs/pantallas/informes-mensuales.mdx',
    markers: [
      '## Preparar el mes actual',
      '## Qué se calcula automáticamente',
      '## Qué debes capturar',
      '## Estados del informe',
      '`draft`',
      '`generated`',
      '`submitted`',
      'generación automática',
    ],
  },
  {
    path: 'apps/administrativo/src/content/docs/investiduras/informes.mdx',
    markers: [
      '## Elegir lista o supervisión',
      '## Estados del informe',
      '## Limitaciones actuales',
      'No uses la plantilla imprimible',
      'no persiste',
      '202',
      '`draft`',
      '`generated`',
      '`submitted`',
    ],
  },
  ...['operativo', 'administrativo'].map((portal) => ({
    path: `apps/${portal}/src/content/docs/procesos/informe-mensual.mdx`,
    markers: [
      '## Separar datos automáticos y manuales',
      '## Calendario operativo',
      '## Matriz de responsabilidades',
      'No crees otro informe',
      '`draft` → `generated` → `submitted`',
      'generación es asíncrona',
    ],
  })),
];

describe('monthly report manuals', () => {
  it.each(manuals)('keeps $path operationally complete', ({ path, markers }) => {
    const source = readFileSync(path, 'utf8');
    const missing = markers.filter((marker) => !source.includes(marker));

    expect(missing, `${path} is missing:\n${missing.join('\n')}`).toEqual([]);
  });
});
