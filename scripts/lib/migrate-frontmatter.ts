import { parseFrontmatter, type MdxRisk } from './content-inventory';

export interface TechnicalFrontmatterOptions {
  module: string;
  generated: boolean;
  mdxRisk: MdxRisk;
  reviewedAt: string;
  publish?: boolean;
}

function yamlString(value: string): string {
  return JSON.stringify(value);
}

export function migrateTechnicalFrontmatter(
  source: string,
  options: TechnicalFrontmatterOptions,
): string {
  const { attributes, body } = parseFrontmatter(source);
  const title = typeof attributes.title === 'string' ? attributes.title : 'Documento técnico';
  const description = typeof attributes.description === 'string'
    ? attributes.description
    : 'Referencia técnica heredada de SACDIA pendiente de revisión editorial.';
  const author = typeof attributes.author === 'string' && attributes.author.trim()
    ? attributes.author.trim()
    : 'engineering';

  const frontmatter = [
    '---',
    `title: ${yamlString(title)}`,
    `description: ${yamlString(description)}`,
    'surface: technical',
    'documentType: reference',
    `module: ${options.module}`,
    `status: ${options.mdxRisk === 'high' || options.publish === false ? 'draft' : 'published'}`,
    'owners:',
    `  - ${yamlString(author)}`,
    `lastReviewedAt: ${options.reviewedAt}`,
    `generated: ${options.generated}`,
    '---',
    '',
  ].join('\n');

  return frontmatter + body.replace(/^\r?\n/, '');
}
