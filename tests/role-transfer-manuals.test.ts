import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface ManualContract {
  path: string;
  markers: string[];
}

interface CoverageRow {
  surface: 'admin' | 'app';
  module: string;
  route_or_feature: string;
  manual_path: string;
  processes: string;
}

const manuals: ManualContract[] = [
  {
    path: 'apps/administrativo/src/content/docs/clubes/solicitudes-cargos.mdx',
    markers: [
      '## Estado operativo',
      'No existe un cliente que cree `POST /requests/assignments`.',
      'El shape esperado por admin difiere del backend.',
      'La aprobación y el rechazo no están disponibles.',
      'El backend no aplica el alcance de sección al listar o revisar.',
      '## Alternativa funcional',
      '/procesos/asignacion-cargo-club/',
    ],
  },
  {
    path: 'apps/administrativo/src/content/docs/clubes/solicitudes-traslados.mdx',
    markers: [
      '## Estado operativo',
      'No hay bandeja funcional de traslados.',
      '`sectionId`',
      'ID, campos y estados incompatibles',
      'No hay decisiones UI disponibles.',
    ],
  },
  {
    path: 'apps/administrativo/src/content/docs/clubes/solicitudes.mdx',
    markers: [
      '## Estado de las bandejas',
      'no operativas',
      '/clubes/solicitudes-cargos/',
      '/clubes/solicitudes-traslados/',
      '/procesos/asignacion-cargo-club/',
      '/procesos/traslado-miembro/',
    ],
  },
  {
    path: 'apps/administrativo/src/content/docs/procesos/asignacion-cargo-club.mdx',
    markers: [
      '## Flujo directo funcional',
      '`POST /clubs/:clubId/sections/:sectionId/roles`',
      '`club_roles:assign`',
      '`active`',
      'cupo',
      'exclusividad',
      '`ended`',
      'Una solicitud no es una asignación.',
    ],
  },
  {
    path: 'apps/administrativo/src/content/docs/procesos/traslado-miembro.mdx',
    markers: [
      '## Responsabilidades',
      'La revisión administrativa está bloqueada por el cliente.',
      '`requests:review`',
      'alcance de destino',
      '`review_comment`',
      'cero asignaciones movidas',
      'No crea ni cambia membresía, enrollment ni clase.',
    ],
  },
  {
    path: 'apps/operativo/src/content/docs/pantallas/cargos.mdx',
    markers: [
      '## Estado operativo',
      '`role_assignments`',
      'deep-link',
      'No tiene entrada visible.',
      'endpoint de solicitudes globales',
      'UUID como int',
      'No promete Mis cargos ni cargos efectivos.',
    ],
  },
  {
    path: 'apps/operativo/src/content/docs/pantallas/traslados.mdx',
    markers: [
      '## Crear una solicitud de traslado',
      'mismo tipo',
      'La app no solicita motivo.',
      'asignación de cargo activa',
      '`pending`',
      '`approved`',
      '`rejected`',
      'No existe cancelación.',
      'duplicado pendiente',
      '`reviewer_comment`',
      '`review_comment`',
    ],
  },
  {
    path: 'apps/operativo/src/content/docs/procesos/asignacion-cargo-club.mdx',
    markers: [
      '## Flujo directo funcional',
      '`POST /clubs/:clubId/sections/:sectionId/roles`',
      '`club_roles:assign`',
      '`active`',
      '`ended`',
      'Una solicitud no es una asignación.',
    ],
  },
  {
    path: 'apps/operativo/src/content/docs/procesos/traslado-miembro.mdx',
    markers: [
      '## Crear desde la app',
      'mismo tipo',
      'asignación de cargo activa',
      '`pending`',
      '`approved`',
      '`rejected`',
      'No existe cancelación.',
      '`review_comment`',
      'No crea ni cambia membresía, enrollment ni clase.',
    ],
  },
  {
    path: 'apps/tecnico/src/content/docs/producto/funcionalidades/gestion-clubs.mdx',
    markers: [
      '## Transferencias implementadas',
      'transferencias implementadas con gaps',
      '`pending`',
      '`approved`',
      '`rejected`',
      'asignaciones de cargo activas',
      'cero asignaciones movidas',
      'No crea ni cambia membresía, enrollment ni clase.',
    ],
  },
];

const negationFillers = new Set([
  'no',
  'sin',
  'nunca',
  'hay',
  'existe',
  'se',
  'puede',
  'debe',
  'esta',
  'está',
  'son',
  'es',
  'permite',
  'garantiza',
  'valida',
  'ofrece',
  'admite',
  'crear',
  'cambia',
  'cambiar',
  'solicita',
  'solicitar',
  'solo',
  'un',
  'una',
  'el',
  'la',
  'los',
  'las',
  'que',
  'por',
  'para',
  'a',
  'al',
  'del',
  'de',
]);

const fillerPattern =
  '(?:hay|existe|se|puede|debe|est[aá]|son|es|permite|garantiza|valida|ofrece|admite|crear|cambia|cambiar|solicita|solicitar|solo|un|una|el|la|los|las|que|por|para|a|al|del|de)';

function readManual(path: string): string {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"' && line[index + 1] === '"' && quoted) {
      current += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      values.push(current);
      current = '';
    } else {
      current += character;
    }
  }

  values.push(current);
  return values;
}

function readCoverage(): CoverageRow[] {
  const [headerLine, ...lines] = readFileSync(
    'docs/migration/surface-coverage.csv',
    'utf8',
  )
    .trim()
    .split('\n');
  const headers = parseCsvLine(headerLine);

  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? '']),
    ) as unknown as CoverageRow;
  });
}

function hasUnnegatedClaim(source: string, claim: RegExp): boolean {
  return source.split('\n').some((line) => {
    claim.lastIndex = 0;
    const match = claim.exec(line);
    if (!match || match.index === undefined) return false;

    const terms = [
      ...new Set(
        (match[0].match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9:_-]*/g) ?? [])
          .map((term) => term.toLowerCase())
          .filter((term) => !negationFillers.has(term)),
      ),
    ];
    if (terms.length === 0) return true;

    const escapedTerms = terms
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    const context = line.slice(
      Math.max(0, match.index - 64),
      match.index + match[0].length,
    );
    const negated = new RegExp(
      `\\b(?:no|sin|nunca)\\b(?:\\s+${fillerPattern})*\\s+(?:${escapedTerms})\\b`,
      'i',
    );

    const plainContext = context.replace(/[`*_~]/g, '');

    return !negated.test(plainContext);
  });
}

describe('claim negation matcher', () => {
  it('recognizes a scope-validation negation despite inline-code markers', () => {
    const scopeValidation =
      /\b(?:backend|endpoint)\b[^.\n]{0,160}\b(?:valida|comprueba|verifica)\b[^.\n]{0,160}\bsectionId\b[^.\n]{0,120}\bclubId\b/i;

    expect(
      hasUnnegatedClaim(
        'El backend no valida que el `sectionId` pertenezca al `clubId`.',
        scopeValidation,
      ),
    ).toBe(false);
    expect(
      hasUnnegatedClaim(
        'El backend valida que el `sectionId` pertenezca al `clubId`.',
        scopeValidation,
      ),
    ).toBe(true);
  });
});

describe('role and transfer manuals', () => {
  it.each(manuals)('keeps $path operationally complete', ({ path, markers }) => {
    const source = readManual(path);
    const missing = [
      ...(source ? [] : ['file does not exist']),
      ...markers.filter((marker) => !source.includes(marker)),
    ];

    expect(missing, `${path} is missing:\n${missing.join('\n')}`).toEqual([]);
  });

  it('does not present the incompatible admin request inboxes as functional', () => {
    const adminRequests = [
      'apps/administrativo/src/content/docs/clubes/solicitudes-cargos.mdx',
      'apps/administrativo/src/content/docs/clubes/solicitudes-traslados.mdx',
      'apps/administrativo/src/content/docs/clubes/solicitudes.mdx',
    ].map(readManual);

    for (const source of adminRequests) {
      expect(hasUnnegatedClaim(source, /\bbandejas?\b[^.\n]{0,100}\b(?:operativa|funcional)\b/i)).toBe(false);
      expect(hasUnnegatedClaim(source, /\b(?:aprobar|rechazar|decidir)\b[^.\n]{0,100}\b(?:solicitud|traslado|cargo)\b/i)).toBe(false);
    }
  });

  it('keeps roles and transfers within the implemented behavior', () => {
    const appRoles = readManual(
      'apps/operativo/src/content/docs/pantallas/cargos.mdx',
    );
    const appTransfers = readManual(
      'apps/operativo/src/content/docs/pantallas/traslados.mdx',
    );
    const transferProcesses = [
      'apps/administrativo/src/content/docs/procesos/traslado-miembro.mdx',
      'apps/operativo/src/content/docs/procesos/traslado-miembro.mdx',
      'apps/tecnico/src/content/docs/producto/funcionalidades/gestion-clubs.mdx',
    ].map(readManual);
    const roleProcesses = [
      'apps/administrativo/src/content/docs/procesos/asignacion-cargo-club.mdx',
      'apps/operativo/src/content/docs/procesos/asignacion-cargo-club.mdx',
    ].map(readManual);

    expect(hasUnnegatedClaim(appRoles, /\bMis cargos\b/i)).toBe(false);
    expect(hasUnnegatedClaim(appRoles, /\bcargo(?:s)? efectivo(?:s)?\b[^.\n]{0,100}\brevoked\b/i)).toBe(false);
    expect(hasUnnegatedClaim(appTransfers, /\b(?:app|aplicaci[oó]n)\b[^.\n]{0,100}\b(?:solicita|pide|requiere)\b[^.\n]{0,100}\bmotivo\b/i)).toBe(false);

    for (const source of [...transferProcesses, appTransfers]) {
      expect(hasUnnegatedClaim(source, /\b(?:cancelaci[oó]n|cancelled)\b/i)).toBe(false);
      expect(hasUnnegatedClaim(source, /\baprobar\b[^.\n]{0,160}\b(?:membres[ií]a|enrollment|inscripci[oó]n|clase)\b/i)).toBe(false);
    }

    for (const source of roleProcesses) {
      expect(hasUnnegatedClaim(source, /\bcrear\b[^.\n]{0,120}\bsolicitud\b[^.\n]{0,120}\bcargo\b/i)).toBe(false);
    }
  });

  it('keeps transfer review comments optional while preserving their backend field', () => {
    const transferProcess = readManual(
      'apps/administrativo/src/content/docs/procesos/traslado-miembro.mdx',
    );

    expect(
      hasUnnegatedClaim(
        transferProcess,
        /\bcomentario\b[^.\n]{0,120}\b(?:requerido|obligatorio)\b/i,
      ),
    ).toBe(false);
    expect(transferProcess).toMatch(
      /(?:\bcomentario\b[^.\n]{0,80}\bopcional\b|\b(?:si se env[ií]a|si se proporciona)\b)[\s\S]{0,240}\b(?:persiste|guarda)\b[\s\S]{0,100}`review_comment`/i,
    );
  });

  it('does not present the inoperative transfer list or detail as app navigation', () => {
    const transferProcess = readManual(
      'apps/operativo/src/content/docs/procesos/traslado-miembro.mdx',
    );

    expect(transferProcess).toMatch(
      /\bAjustes > Cambiar club\b[^.\n]{0,120}\b(?:entrada visible|crear|inicia)\b/i,
    );
    expect(transferProcess).toMatch(
      /\b(?:resoluci[oó]n|estado final)\b[^.\n]{0,160}\bcanal institucional\b/i,
    );
    expect(
      hasUnnegatedClaim(
        transferProcess,
        /\b(?:abre|navega|entra|consulta|revisa|sigue)\b[^.\n]{0,120}\b(?:lista(?:do)?|detalle)\b/i,
      ),
    ).toBe(false);
    expect(
      hasUnnegatedClaim(
        transferProcess,
        /\/transfers\b[^.\n]{0,120}\b(?:lista(?:do)?|detalle|navega|abre|consulta)\b/i,
      ),
    ).toBe(false);
  });

  it('documents the missing section-to-club scope validation', () => {
    const roleProcesses = [
      'apps/administrativo/src/content/docs/procesos/asignacion-cargo-club.mdx',
      'apps/operativo/src/content/docs/procesos/asignacion-cargo-club.mdx',
    ].map(readManual);

    for (const source of roleProcesses) {
      expect(source).toMatch(
        /\b(?:backend|endpoint)\b[^.\n]{0,160}\bno (?:valida|comprueba|verifica)\b[^.\n]{0,160}\bsectionId\b[^.\n]{0,120}\bclubId\b/i,
      );
      expect(
        hasUnnegatedClaim(
          source,
          /\b(?:backend|endpoint)\b[^.\n]{0,160}\b(?:valida|comprueba|verifica)\b[^.\n]{0,160}\bsectionId\b[^.\n]{0,120}\bclubId\b/i,
        ),
      ).toBe(false);
    }
  });

  it('separates the limited app role editor from admin role management', () => {
    const members = readManual(
      'apps/operativo/src/content/docs/pantallas/miembros.mdx',
    );
    const appProcess = readManual(
      'apps/operativo/src/content/docs/procesos/asignacion-cargo-club.mdx',
    );
    const adminProcess = readManual(
      'apps/administrativo/src/content/docs/procesos/asignacion-cargo-club.mdx',
    );

    for (const source of [members, appProcess]) {
      expect(source).toMatch(/\bsecci[oó]n contextual\b/i);
      expect(source).toMatch(
        /(?<![\p{L}\p{N}_])(?:solo|únicamente)(?![\p{L}\p{N}_])[^.\n]{0,120}\brol\b/iu,
      );
      expect(source).toMatch(/`start_date`[^.\n]{0,120}\b(?:ahora|actual)\b/i);
      expect(
        hasUnnegatedClaim(
          source,
          /\b(?:elige|selecciona|define|cambia)\b[^.\n]{0,120}\b(?:secci[oó]n|fechas?)\b/i,
        ),
      ).toBe(false);
      expect(
        hasUnnegatedClaim(source, /\brevoca(?:r)?\b[^.\n]{0,120}\bcargo\b/i),
      ).toBe(false);
    }

    expect(adminProcess).toMatch(
      /\bAdmin Club\s*→\s*Roles\b[^.\n]{0,160}\b(?:secci[oó]n|fechas?)\b/i,
    );
    expect(adminProcess).toMatch(/\bclub_roles:revoke\b/i);
  });

  it('documents director initial assignment and succession with their allowed global roles', () => {
    const roleProcesses = [
      'apps/administrativo/src/content/docs/procesos/asignacion-cargo-club.mdx',
      'apps/operativo/src/content/docs/procesos/asignacion-cargo-club.mdx',
    ].map(readManual);

    for (const source of roleProcesses) {
      expect(source).toMatch(/\b(?:asignaci[oó]n inicial|sucesi[oó]n anual)\b/i);
      expect(source).toContain('`super-admin`');
      expect(source).toContain('`admin`');
      expect(source).toContain('`director-lf`');
      expect(source).toContain('`assistant-lf`');
      expect(source).toMatch(/\bgesti[oó]n (?:del|sobre el) club\b/i);
      expect(
        hasUnnegatedClaim(
          source,
          /\b(?:permiso gen[eé]rico|club_roles:assign|club_roles:revoke)\b[^.\n]{0,120}\b(?:suficiente|basta|por s[ií] solo)\b/i,
        ),
      ).toBe(false);
    }
  });

  it('treats any pending transfer for the user as the duplicate blocker', () => {
    const transferManuals = [
      'apps/operativo/src/content/docs/pantallas/traslados.mdx',
      'apps/operativo/src/content/docs/procesos/traslado-miembro.mdx',
      'apps/administrativo/src/content/docs/procesos/traslado-miembro.mdx',
      'apps/tecnico/src/content/docs/producto/funcionalidades/gestion-clubs.mdx',
    ].map(readManual);

    for (const source of transferManuals) {
      expect(source).toMatch(
        /(?:\b(?:cualquier|una)\b[^.\n]{0,80}\bsolicitud\b[^.\n]{0,100}\bpending\b[^.\n]{0,160}\b(?:bloquea|impide)\b[^.\n]{0,160}\b(?:segunda|otra|cualquier)\b[^.\n]{0,100}\bsolicitud\b|\b(?:persona|usuario)\b[^.\n]{0,120}\b(?:cualquier|otra|segunda)\b[^.\n]{0,100}\bsolicitud\b[^.\n]{0,120}\bpending\b|\b(?:bloquea|impide)\b[^.\n]{0,120}\b(?:otra|segunda|nueva)\b[^.\n]{0,100}\bsolicitud\b[^.\n]{0,160}\b(?:mientras|si)\b[^.\n]{0,120}\b(?:exista|haya)\b[^.\n]{0,80}\b(?:cualquier|una)\b[^.\n]{0,80}\bsolicitud\b[^.\n]{0,80}\bpending\b[^.\n]{0,120}\b(?:persona|usuario)\b)/i,
      );
      expect(
        hasUnnegatedClaim(
          source,
          /\b(?:solo|únicamente)\b[^.\n]{0,100}\b(?:mismo|igual)\b[^.\n]{0,120}\b(?:origen|destino)\b[^.\n]{0,160}\bpending\b/i,
        ),
      ).toBe(false);
    }
  });

  it('maps the four role and transfer surfaces to their specific manuals and processes', () => {
    const rows = readCoverage();

    expect(rows).toHaveLength(171);
    expect(rows.filter((row) => row.surface === 'admin')).toHaveLength(134);
    expect(rows.filter((row) => row.surface === 'app')).toHaveLength(37);
    expect(
      rows
        .filter(
          (row) =>
            (row.surface === 'admin' &&
              row.route_or_feature === '/dashboard/requests/assignments') ||
            (row.surface === 'admin' &&
              row.route_or_feature === '/dashboard/requests/transfers') ||
            (row.surface === 'app' && row.route_or_feature === 'role_assignments') ||
            (row.surface === 'app' && row.route_or_feature === 'transfers'),
        )
        .map(({ surface, route_or_feature, manual_path, processes }) => ({
          surface,
          route_or_feature,
          manual_path,
          processes,
        })),
    ).toEqual([
      {
        surface: 'admin',
        route_or_feature: '/dashboard/requests/assignments',
        manual_path: '/clubes/solicitudes-cargos/',
        processes: '/procesos/asignacion-cargo-club/',
      },
      {
        surface: 'admin',
        route_or_feature: '/dashboard/requests/transfers',
        manual_path: '/clubes/solicitudes-traslados/',
        processes: '/procesos/traslado-miembro/',
      },
      {
        surface: 'app',
        route_or_feature: 'role_assignments',
        manual_path: '/pantallas/cargos/',
        processes: '/procesos/asignacion-cargo-club/',
      },
      {
        surface: 'app',
        route_or_feature: 'transfers',
        manual_path: '/pantallas/traslados/',
        processes: '/procesos/traslado-miembro/',
      },
    ]);
  });
});
