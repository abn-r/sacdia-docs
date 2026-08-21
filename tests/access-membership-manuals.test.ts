import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface ManualContract {
  path: string;
  markers: string[];
}

const manuals: ManualContract[] = [
  {
    path: 'apps/operativo/src/content/docs/pantallas/acceso-y-registro.mdx',
    markers: [
      '## Elegir el acceso correcto',
      '## Crear una cuenta',
      '## Iniciar sesión',
      '## Recuperar la contraseña',
      '## Después de autenticarte',
      'correo y contraseña',
      'Google y Apple',
      '30 segundos',
    ],
  },
  {
    path: 'apps/operativo/src/content/docs/pantallas/completar-perfil.mdx',
    markers: [
      '## Paso 1: foto',
      '## Paso 2: datos personales y contactos',
      '## Declarar salud sin ambigüedad',
      '## Paso 3: club, sección y clase',
      '## Mientras la solicitud está pendiente',
      '## Cancelar y elegir otra sección',
      '## Limitación actual de autocorrección',
      '`pending`',
      'inscripción anual',
      '8 días',
    ],
  },
  {
    path: 'apps/operativo/src/content/docs/pantallas/miembros.mdx',
    markers: [
      '## Revisar solicitudes en la app',
      '`club_roles:assign`',
      '`club_members:approve`',
      'control visual',
      'sin confirmación',
      'subdirección, secretaría y secretaría-tesorería',
    ],
  },
  {
    path: 'apps/administrativo/src/content/docs/clubes/solicitudes-membresia.mdx',
    markers: [
      'rol admitido en el panel administrativo',
      '## Seleccionar la sección',
      '## Revisar antes de decidir',
      '## Aprobar',
      '## Rechazar',
      '## Estados y vencimiento',
      '## Limitación del plazo',
      'fecha visible y el vencimiento automático pueden divergir',
      '## Limitación de auditoría',
      '`modified_at`',
      '`approved_at`',
      '`rejected_at`',
      'un rechazo o vencimiento puede no mostrar',
      '`club_members:approve`',
      '48 horas',
      'bandera `active: true`',
      '`active`',
      '`rejected`',
      '`expired`',
      'motivo es opcional',
    ],
  },
  ...['operativo', 'administrativo'].map((portal) => ({
    path: `apps/${portal}/src/content/docs/procesos/alta-y-membresia.mdx`,
    markers: [
      '## No confundas cuenta y membresía',
      '## Matriz de responsabilidades',
      '## Canal de revisión según el cargo',
      '**Cargos de club:**',
      '**Roles administrativos o territoriales:**',
      '## Estados de la solicitud',
      'Los cargos de club no obtienen acceso al panel',
      'autocorrección no siempre aparece',
      'La comprobación visual confiable es `active`',
      'fecha visible y el vencimiento automático pueden divergir',
      '`pending` → `active`',
      '`rejected`',
      '`cancelled`',
      '`expired`',
      'inscripción anual',
      'No crees otra cuenta',
    ],
  })),
];

describe('access and membership manuals', () => {
  it.each(manuals)('keeps $path operationally complete', ({ path, markers }) => {
    const source = readFileSync(path, 'utf8');
    const missing = markers.filter((marker) => !source.includes(marker));

    expect(missing, `${path} is missing:\n${missing.join('\n')}`).toEqual([]);
  });

  it('keeps membership separate from assignment and transfer requests', () => {
    const source = readFileSync(
      'apps/administrativo/src/content/docs/clubes/solicitudes.mdx',
      'utf8',
    );

    expect(source).toContain('/dashboard/requests/assignments');
    expect(source).toContain('/dashboard/requests/transfers');
    expect(source).not.toContain('/dashboard/requests/membership');
  });
});
