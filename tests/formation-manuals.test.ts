import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface ManualContract {
  path: string;
  markers: string[];
}

const manuals: ManualContract[] = [
  {
    path: 'apps/operativo/src/content/docs/pantallas/clases-progresivas.mdx',
    markers: [
      '## Entiende el progreso',
      '## Estados de un requisito',
      '## Enviar la clase a investidura',
      '`PENDING`',
      '`SUBMITTED`',
      '`VALIDATED`',
      '`REJECTED`',
    ],
  },
  {
    path: 'apps/operativo/src/content/docs/pantallas/especialidades.mdx',
    markers: [
      '## Elige cómo completar la especialidad',
      '## Estados de revisión',
      '## Corregir una devolución',
      '`IN_APP`',
      '`EXTERNAL`',
      '`PENDING_REVIEW`',
      '`APPROVED`',
    ],
  },
  {
    path: 'apps/operativo/src/content/docs/pantallas/certificaciones.mdx',
    markers: [
      '## Antes de inscribirte',
      '## Trabajar un requisito',
      '## Cerrar la certificación',
      '`DRAFT`',
      '`CHANGES_REQUESTED`',
      '`READY_FOR_CLOSEOUT`',
      'comprobante de junta',
    ],
  },
  {
    path: 'apps/administrativo/src/content/docs/investiduras/certificaciones.mdx',
    markers: [
      '## Elegir la bandeja correcta',
      '## Revisar un requisito',
      '## Resolver el cierre final',
      '`certifications:review`',
      '`certifications:certify`',
      '**Requisitos**',
      '**Cierres**',
    ],
  },
  ...['operativo', 'administrativo'].map((portal) => ({
    path: `apps/${portal}/src/content/docs/procesos/formacion-e-investidura.mdx`,
    markers: [
      '## No mezcles los tres flujos',
      '## Matriz de responsabilidades',
      'Clase progresiva',
      'Especialidad',
      'Certificación',
      'No crees una inscripción nueva',
    ],
  })),
];

describe('formation and investiture manuals', () => {
  it.each(manuals)('keeps $path operationally complete', ({ path, markers }) => {
    const source = readFileSync(path, 'utf8');
    const missing = markers.filter((marker) => !source.includes(marker));

    expect(missing, `${path} is missing:\n${missing.join('\n')}`).toEqual([]);
  });
});
