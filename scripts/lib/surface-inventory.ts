export interface SurfaceCoverageRow {
  surface: 'admin' | 'app';
  module: string;
  route_or_feature: string;
  manual_path: string;
  processes: string;
  status: 'missing' | 'draft' | 'published';
  owner: string;
}

const excludedMobileFeatures = new Set(['accessibility']);

export function adminPageToCoverage(filePath: string): SurfaceCoverageRow | null {
  const normalized = filePath.replaceAll('\\', '/');
  if (!normalized.endsWith('/page.tsx') && normalized !== 'page.tsx') return null;
  if (normalized.includes('[...')) return null;

  const routeParts = normalized
    .replace(/\/page\.tsx$/, '')
    .replace(/^page\.tsx$/, '')
    .split('/')
    .filter((part) => part && !/^\(.+\)$/.test(part));
  const route = `/${routeParts.join('/')}` || '/';
  const moduleParts = routeParts[0] === 'dashboard' ? routeParts.slice(1) : routeParts;
  const module = moduleParts[0] || 'dashboard';
  const manualSlug = route === '/' ? 'dashboard' : route.slice(1);

  return {
    surface: 'admin',
    module,
    route_or_feature: route,
    manual_path: `/pantallas/${manualSlug}/`,
    processes: '',
    status: 'missing',
    owner: 'documentation',
  };
}

export function mobileFeatureToCoverage(feature: string): SurfaceCoverageRow | null {
  const normalized = feature.trim().replaceAll('\\', '/').split('/').filter(Boolean).at(-1) ?? '';
  if (!normalized || excludedMobileFeatures.has(normalized) || normalized.startsWith('_')) return null;

  return {
    surface: 'app',
    module: normalized,
    route_or_feature: normalized,
    manual_path: `/pantallas/${normalized}/`,
    processes: '',
    status: 'missing',
    owner: 'documentation',
  };
}

function escapeCsv(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function surfaceCoverageToCsv(rows: SurfaceCoverageRow[]): string {
  const columns: Array<keyof SurfaceCoverageRow> = [
    'surface',
    'module',
    'route_or_feature',
    'manual_path',
    'processes',
    'status',
    'owner',
  ];

  return [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(',')),
  ].join('\n') + '\n';
}
