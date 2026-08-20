export type TargetPortal = 'operativo' | 'administrativo' | 'tecnico' | 'revisar';
export type MdxRisk = 'low' | 'high';

export interface ParsedDocument {
  attributes: Record<string, string | boolean | number>;
  body: string;
}

export interface Classification {
  targetPortal: TargetPortal;
  targetPath: string;
}

export interface InventoryRow {
  source_path: string;
  target_portal: TargetPortal;
  target_path: string;
  generated: boolean;
  mdx_risk: MdxRisk;
  status: 'ready' | 'review';
  owner: string;
  notes: string;
}

function parseScalar(value: string): string | boolean | number {
  const normalized = value.trim().replace(/^(['"])(.*)\1$/, '$2');

  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(normalized)) return Number(normalized);

  return normalized;
}

export function parseFrontmatter(source: string): ParsedDocument {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { attributes: {}, body: source };

  const attributes: Record<string, string | boolean | number> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const entry = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (entry) attributes[entry[1]] = parseScalar(entry[2]);
  }

  return { attributes, body: source.slice(match[0].length) };
}

export function detectGenerated(source: string): boolean {
  return /(AUTO-GENERATED FILE|GENERATED FILE|GENERADO AUTOM[AÁ]TICAMENTE)/i.test(source);
}

export function detectMdxRisk(source: string): MdxRisk {
  const withoutFences = source.replace(/(```|~~~)[\s\S]*?\1/g, '');
  const hasModuleSyntax = /^\s*(import|export)\s/m.test(withoutFences);
  const hasJsxComponent = /<\/?[A-Z][A-Za-z0-9.]*(?:\s|\/?>)/.test(withoutFences);

  return hasModuleSyntax || hasJsxComponent ? 'high' : 'low';
}

export function classifyLegacyDocument(sourcePath: string): Classification {
  const normalized = sourcePath.replaceAll('\\', '/');

  if (normalized === 'content/dev/index.mdx') {
    return { targetPortal: 'tecnico', targetPath: 'referencia/index.mdx' };
  }

  if (normalized === 'content/docs/index.mdx') {
    return { targetPortal: 'revisar', targetPath: 'revision/legacy-documentation-index.mdx' };
  }

  const mappings: Array<[string, string]> = [
    ['content/dev/', ''],
    ['content/docs/autorizacion/', 'seguridad/autorizacion/'],
    ['content/docs/fundamentos/', 'arquitectura/fundamentos/'],
    ['content/docs/guias/', 'guias/'],
    ['content/docs/sistema-de-diseno/', 'frontend/sistema-de-diseno/'],
    ['content/docs/funcionalidades/', 'producto/funcionalidades/'],
  ];

  for (const [prefix, targetPrefix] of mappings) {
    if (normalized.startsWith(prefix)) {
      return {
        targetPortal: 'tecnico',
        targetPath: `${targetPrefix}${normalized.slice(prefix.length)}`,
      };
    }
  }

  return {
    targetPortal: 'revisar',
    targetPath: `revisar/${normalized.replace(/^content\//, '')}`,
  };
}

export function createInventoryRow(sourcePath: string, source: string): InventoryRow {
  const parsed = parseFrontmatter(source);
  const classification = classifyLegacyDocument(sourcePath);
  const generated = detectGenerated(source);
  const mdxRisk = detectMdxRisk(parsed.body);
  const needsReview = classification.targetPortal === 'revisar' || mdxRisk === 'high';
  const author = typeof parsed.attributes.author === 'string' ? parsed.attributes.author : '';

  return {
    source_path: sourcePath.replaceAll('\\', '/'),
    target_portal: classification.targetPortal,
    target_path: classification.targetPath,
    generated,
    mdx_risk: mdxRisk,
    status: needsReview ? 'review' : 'ready',
    owner: author || (classification.targetPortal === 'tecnico' ? 'engineering' : 'documentation'),
    notes: classification.targetPortal === 'revisar'
      ? 'Requiere clasificación editorial; no publicar automáticamente.'
      : mdxRisk === 'high'
        ? 'Revisar compatibilidad MDX antes de publicar.'
        : generated
          ? 'Contenido generado; actualizar mediante su script de sincronización.'
          : '',
  };
}

function escapeCsv(value: unknown): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function inventoryToCsv(rows: InventoryRow[]): string {
  const columns: Array<keyof InventoryRow> = [
    'source_path',
    'target_portal',
    'target_path',
    'generated',
    'mdx_risk',
    'status',
    'owner',
    'notes',
  ];

  return [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(',')),
  ].join('\n') + '\n';
}
