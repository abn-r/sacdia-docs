import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface ManualContract {
  path: string;
  markers: string[];
}

const manuals: ManualContract[] = [
  {
    path: 'apps/operativo/src/content/docs/pantallas/notificaciones.mdx',
    markers: [
      '## Bandeja e historial',
      '20 notificaciones por página',
      'Marcar como leída',
      '## Abrir el detalle',
      'La bandeja abre el detalle; no abre un destino.',
      '## Tocar una notificación push',
      'lista permitida de rutas',
    ],
  },
  {
    path: 'apps/operativo/src/content/docs/pantallas/ajustes-notificaciones.mdx',
    markers: [
      '## Interruptor maestro',
      'actividades',
      'logros',
      'aprobaciones',
      'invitaciones',
      'recordatorios',
      'restaura el estado anterior',
      'bandeja',
      'iOS Simulator',
      'FCM',
    ],
  },
  {
    path: 'apps/administrativo/src/content/docs/configuracion/notificaciones.mdx',
    markers: [
      '## Modalidades de envío',
      '**Directo**',
      '**Global**',
      '**Sección**',
      '`notifications:send`',
      '`notifications:broadcast`',
      '`notifications:club`',
      '`active_assignment`',
      'No hay segmentación territorial ni por categoría.',
      '`queued` no equivale a entregado',
    ],
  },
  {
    path: 'apps/operativo/src/content/docs/procesos/recepcion-notificaciones.mdx',
    markers: [
      '## Cambio de responsable',
      '## Flujo principal',
      'bandeja',
      '## Cómo verificarlo',
      '## Límites actuales',
    ],
  },
  {
    path: 'apps/administrativo/src/content/docs/procesos/envio-notificaciones.mdx',
    markers: [
      '## Cambio de responsable',
      '## Flujo principal',
      '`queued`',
      '## Cómo verificarlo',
      '## Límites actuales',
    ],
  },
  {
    path: 'apps/tecnico/src/content/docs/producto/funcionalidades/comunicaciones.mdx',
    markers: [
      '## Bandeja persistente',
      '## Preferencias por categoría',
      '## Entrega asíncrona',
      'BullMQ',
      'reintentos',
      'tokens FCM',
      'La bandeja persistente y el push son canales separados.',
    ],
  },
  {
    path: 'apps/tecnico/src/content/docs/api/endpoints.mdx',
    markers: [
      'POST /api/v1/notifications/send',
      'POST /api/v1/notifications/broadcast',
      'POST /api/v1/notifications/club/{instanceType}/{instanceId}',
      'GET /api/v1/notifications/history',
      'GET /api/v1/notifications/unread-count',
      'PATCH /api/v1/notifications/{deliveryId}/read',
      'PATCH /api/v1/notifications/read-all',
      'GET /api/v1/users/me/notification-preferences',
      'PATCH /api/v1/users/me/notification-preferences',
      'POST /api/v1/users/me/fcm-tokens',
    ],
  },
  {
    path: 'apps/tecnico/src/content/docs/api/servicios-externos.mdx',
    markers: [
      'POST /api/v1/notifications/send',
      'POST /api/v1/notifications/broadcast',
      'POST /api/v1/notifications/club/:instanceType/:instanceId',
      'GET /api/v1/notifications/history',
      'GET /api/v1/notifications/unread-count',
      'PATCH /api/v1/notifications/:deliveryId/read',
      'PATCH /api/v1/notifications/read-all',
      'GET /api/v1/users/me/notification-preferences',
      'PATCH /api/v1/users/me/notification-preferences',
      'POST /api/v1/users/me/fcm-tokens',
    ],
  },
  ...['operativo', 'administrativo'].map((portal) => ({
    path: `apps/${portal}/src/content/docs/procesos/comunicacion-recursos.mdx`,
    markers: [
      'Recursos y notificaciones son procesos independientes.',
      'Publicar un recurso no envía una notificación.',
      portal === 'operativo'
        ? '/procesos/recepcion-notificaciones/'
        : '/procesos/envio-notificaciones/',
    ],
  })),
];

function readManual(path: string): string {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

describe('notification manuals', () => {
  it.each(manuals)('keeps $path operationally complete', ({ path, markers }) => {
    const source = readManual(path);
    const missing = [
      ...(source ? [] : ['file does not exist']),
      ...markers.filter((marker) => !source.includes(marker)),
    ];

    expect(missing, `${path} is missing:\n${missing.join('\n')}`).toEqual([]);
  });

  it('keeps notification delivery independent from unsupported targeting and resource publishing', () => {
    const admin = readManual(
      'apps/administrativo/src/content/docs/configuracion/notificaciones.mdx',
    );
    const inbox = readManual(
      'apps/operativo/src/content/docs/pantallas/notificaciones.mdx',
    );
    const resources = ['operativo', 'administrativo'].map((portal) =>
      readManual(`apps/${portal}/src/content/docs/procesos/comunicacion-recursos.mdx`),
    );

    expect(admin).not.toContain('alcance territorial y tipo de club');
    expect(admin).not.toMatch(/\b(?:redacta|composer)\b[^.\n]{0,120}\bdestino\b/i);
    expect(inbox).not.toMatch(
      /\bbandeja\b[^.\n]{0,120}(?<!no )\babre (?:un |su )?destino\b/i,
    );

    for (const source of resources) {
      expect(source).not.toMatch(
        /\bpublicar (?:un |el )?recurso\b[^.\n]{0,120}(?<!no )(?:env[ií]a|notifica)\b/i,
      );
    }
  });

  it.each([
    'apps/administrativo/src/content/docs/configuracion/notificaciones.mdx',
    'apps/administrativo/src/content/docs/procesos/envio-notificaciones.mdx',
  ])(
    '%s does not confuse notification history with delivery confirmation',
    (path) => {
      const source = readManual(path);

      expect(source).toMatch(
        /\bhistorial\b[^.\n]{0,120}\b(?:verifica|confirma|permite verificar)\b[^.\n]{0,120}\b(?:registro|destino|contadores? t[eé]cnicos?)\b/i,
      );
      expect(source).not.toMatch(
        /\bhistorial\b[^.\n]{0,160}(?<!no )\b(?:confirma|verifica)\b[^.\n]{0,160}\b(?:entrega|recepci[oó]n (?:del |de )?push|lectura individual|lectura de (?:cada|una) notificaci[oó]n)\b/i,
      );
    },
  );
});
