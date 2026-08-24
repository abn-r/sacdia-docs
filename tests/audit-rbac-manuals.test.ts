import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface ManualContract {
  path: string;
  markers: string[];
}

const manuals: ManualContract[] = [
  {
    path: 'apps/administrativo/src/content/docs/configuracion/auditoria.mdx',
    markers: [
      '## Acceso requerido',
      '`super-admin`',
      '`audit:read`',
      'alcance global',
      '## Filtros disponibles',
      'Entidad',
      'Acción',
      'Resultado',
      'Origen',
      'Fechas',
      'cursor',
      '## Consultar el detalle',
    ],
  },
  {
    path: 'apps/administrativo/src/content/docs/configuracion/roles.mdx',
    markers: [
      '`roles:read`',
      '`super-admin`',
      '`permissions:assign`',
      '`GLOBAL`',
      '`CLUB`',
      '## Copiar y sincronizar permisos',
      'reemplaza el conjunto completo',
      'super-admin es protegido',
      'asignaciones activas',
    ],
  },
  {
    path: 'apps/administrativo/src/content/docs/configuracion/permisos.mdx',
    markers: [
      '`permissions:read`',
      '`super-admin`',
      '`permissions:assign`',
      '`resource:action`',
      'baja lógica',
      'No garantiza la revocación inmediata de los grants por rol.',
    ],
  },
  {
    path: 'apps/administrativo/src/content/docs/configuracion/matriz-de-permisos.mdx',
    markers: [
      '`roles:read`',
      '`permissions:read`',
      'El menú usa OR; no equivale a acceso completo.',
      '`super-admin`',
      '`permissions:assign`',
      'reemplaza el conjunto completo',
      'La matriz no tiene alcance territorial.',
    ],
  },
  {
    path: 'apps/administrativo/src/content/docs/configuracion/permisos-directos-usuario.mdx',
    markers: [
      '`super-admin`',
      '`permissions:read`',
      '`permissions:assign`',
      '`effective.permissions`',
      'auditoría',
      'duplicado activo',
    ],
  },
  {
    path: 'apps/administrativo/src/content/docs/clubes/detalle-usuario.mdx',
    markers: [
      '`admin`',
      '`super-admin`',
      '`roles:read`',
      '`permissions:assign`',
      'super-admin es protegido',
      '`GLOBAL`',
      'El backend no valida `role_category`.',
      'No administra cargos ni roles de club.',
    ],
  },
  {
    path: 'apps/tecnico/src/content/docs/producto/funcionalidades/audit-logs.mdx',
    markers: [
      '`GET /api/v1/admin/audit-logs`',
      '`GET /api/v1/admin/audit-logs/:id`',
      '`audit:read`',
      '`entity_type`',
      '`action`',
      '`result`',
      '`source`',
      '`from`',
      '`to`',
      '`cursor`',
      '## Interceptor HTTP de auditoría',
      'best-effort',
      'POST/PUT/PATCH/DELETE',
      'Nunca persiste el body',
    ],
  },
  {
    path: 'apps/tecnico/src/content/docs/producto/funcionalidades/rbac.mdx',
    markers: [
      '`grants.direct_permissions`',
      '`effective.permissions`',
      '`GUARD_RBAC_MISCONFIGURATION`',
      'fail-closed',
      '`super-admin`',
      '`assistant-admin`',
    ],
  },
  {
    path: 'apps/tecnico/src/content/docs/seguridad/autorizacion/matriz-rbac.mdx',
    markers: [
      '`audit:read`',
      '`notifications:club`',
      '`active_assignment`',
      'No tiene alcance territorial.',
    ],
  },
  {
    path: 'apps/tecnico/src/content/docs/seguridad/autorizacion/permisos.mdx',
    markers: [
      '`resource:action`',
      '`roles:read`',
      '`permissions:assign`',
      '`audit:read`',
      '`notifications:club`',
    ],
  },
  {
    path: 'apps/tecnico/src/content/docs/seguridad/autorizacion/modelo.mdx',
    markers: [
      '`grants.direct_permissions`',
      '`effective.permissions`',
      '`active_assignment`',
      '`super-admin`',
      '`assistant-admin`',
    ],
  },
  {
    path: 'apps/tecnico/src/content/docs/seguridad/autorizacion/contrato-canonico.mdx',
    markers: [
      '`grants.direct_permissions`',
      '`effective.permissions`',
      '`active_assignment`',
      '`super-admin`',
      '`assistant-admin`',
    ],
  },
];

function readManual(path: string): string {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function hasUnnegatedClaim(source: string, claim: RegExp): boolean {
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
    'usar',
    'use',
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
    '(?:hay|existe|se|puede|debe|est[aá]|son|es|permite|garantiza|valida|ofrece|admite|usar|use|un|una|el|la|los|las|que|por|para|a|al|del|de)';

  return source.split('\n').some((line) => {
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

    return !negated.test(context);
  });
}

describe('hasUnnegatedClaim', () => {
  it('permits a capability explicitly negated next to the asserted terms', () => {
    expect(
      hasUnnegatedClaim(
        'No hay filtros por actor disponibles.',
        /\bfiltros?\b[^.\n]{0,80}\bactor\b/i,
      ),
    ).toBe(false);
  });

  it('does not let an unrelated negation hide a positive capability claim', () => {
    expect(
      hasUnnegatedClaim(
        'No hay exportación pendiente; admin puede consultar auditoría.',
        /\badmin\b\s+puede\s+consultar\b[^.\n]{0,80}\bauditor[ií]a\b/i,
      ),
    ).toBe(true);
  });
});

describe('audit and RBAC manuals', () => {
  it.each(manuals)('keeps $path operationally complete', ({ path, markers }) => {
    const source = readManual(path);
    const missing = [
      ...(source ? [] : ['file does not exist']),
      ...markers.filter((marker) => !source.includes(marker)),
    ];

    expect(missing, `${path} is missing:\n${missing.join('\n')}`).toEqual([]);
  });

  it('does not invent audit viewer capabilities or authorization', () => {
    const audit = readManual(
      'apps/administrativo/src/content/docs/configuracion/auditoria.mdx',
    );
    const technical = readManual(
      'apps/tecnico/src/content/docs/producto/funcionalidades/audit-logs.mdx',
    );

    expect(hasUnnegatedClaim(audit, /\b(?:filtro|filtrar|selector)\b[^.\n]{0,120}\b(?:actor|club|correlaci[oó]n)\b/i)).toBe(false);
    expect(hasUnnegatedClaim(audit, /\bexport(?:ar|aci[oó]n)?\b/i)).toBe(false);
    expect(hasUnnegatedClaim(technical, /\badmin\b\s+(?:puede(?:\s+(?:consultar|acceder|ver))?|consulta|accede|tiene acceso|con acceso)\b[^.\n]{0,120}\b(?:auditor[ií]a|audit)\b/i)).toBe(false);
    expect(hasUnnegatedClaim(technical, /\baudit:read\b[^.\n]{0,80}\b(?:suficiente|basta|por s[ií] solo)\b/i)).toBe(false);
  });

  it('keeps direct permissions and RBAC guarantees bounded to the runtime contract', () => {
    const permissions = readManual(
      'apps/administrativo/src/content/docs/configuracion/permisos.mdx',
    );
    const matrix = readManual(
      'apps/administrativo/src/content/docs/configuracion/matriz-de-permisos.mdx',
    );
    const directPermissions = readManual(
      'apps/administrativo/src/content/docs/configuracion/permisos-directos-usuario.mdx',
    );

    expect(hasUnnegatedClaim(permissions, /\b(?:baja|desactivaci[oó]n|revocaci[oó]n)\b[^.\n]{0,160}\b(?:revocaci[oó]n inmediata|inmediata)\b/i)).toBe(false);
    expect(hasUnnegatedClaim(matrix, /\bmatriz\b[^.\n]{0,120}\bterritorial\b/i)).toBe(false);
    expect(directPermissions).not.toMatch(/\b(?:no hay|sin)\b[^.\n]{0,120}\b(?:UI|interfaz)\b[^.\n]{0,120}\bpermisos directos\b/i);
    expect(directPermissions).not.toMatch(/\b(?:no hay|sin)\b[^.\n]{0,120}\bauditor[ií]a\b[^.\n]{0,120}\bpermisos directos\b/i);
  });

  it('documents the GLOBAL role filter as a UI-only constraint', () => {
    const rbac = readManual(
      'apps/tecnico/src/content/docs/producto/funcionalidades/rbac.mdx',
    );

    expect(rbac).toMatch(
      /(?:\b(?:UI|interfaz)\b[^.\n]{0,120}\b(?:filtra|muestra|limita)\b[^.\n]{0,120}\bGLOBAL\b|\bGLOBAL\b[^.\n]{0,120}\b(?:filtra|muestra|limita)\b[^.\n]{0,120}\b(?:UI|interfaz)\b)/i,
    );
    expect(rbac).toMatch(
      /(?:\b(?:backend|ruta productiva)\b[^.\n]{0,160}\b(?:no valida|sin validar)\b[^.\n]{0,160}\brole_category\b|\brole_category\b[^.\n]{0,160}\b(?:no est[aá] validado|sin validar)\b[^.\n]{0,160}\b(?:backend|ruta productiva)\b)/i,
    );
    expect(
      hasUnnegatedClaim(
        rbac,
        /\b(?:backend|ruta productiva)\b[^.\n]{0,160}\b(?:garantiza|valida|restringe|solo permite)\b[^.\n]{0,160}\b(?:asignaciones|roles)\b[^.\n]{0,80}\bGLOBAL\b/i,
      ),
    ).toBe(false);
  });

  it('uses canonical audit and RBAC names without legacy claims', () => {
    const technicalSources = manuals
      .filter(({ path }) => path.includes('/tecnico/'))
      .map(({ path }) => readManual(path));

    for (const source of technicalSources) {
      expect(hasUnnegatedClaim(source, /\/api\/v1\/audit-logs\b/i)).toBe(false);
      expect(hasUnnegatedClaim(source, /\baudit_logs:read\b/i)).toBe(false);
      expect(hasUnnegatedClaim(source, /\bAuditLogsService\.log\b/i)).toBe(false);
      expect(hasUnnegatedClaim(source, /\b(?:borrado|eliminaci[oó]n) f[ií]sic[ao]\b/i)).toBe(false);
      expect(hasUnnegatedClaim(source, /\b(?:super_admin|assistant_admin)\b/i)).toBe(false);
    }
  });
});
