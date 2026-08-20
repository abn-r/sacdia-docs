import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('documentation UI contract', () => {
  it('labels the portal navigation for assistive technology', () => {
    const switcher = readFileSync('packages/ui/src/components/PortalSwitcher.astro', 'utf8');

    expect(switcher).toContain('<nav');
    expect(switcher).toContain('aria-label="Cambiar portal de documentación"');
  });

  it('centralizes the SACDIA brand colors in tokens', () => {
    const tokens = readFileSync('packages/ui/src/styles/tokens.css', 'utf8').toLowerCase();

    expect(tokens).toContain('#f06151');
    expect(tokens).toContain('#183651');
    expect(tokens).toContain('#4fbf9f');
  });

  it('honors reduced motion preferences', () => {
    const styles = readFileSync('packages/ui/src/styles/starlight.css', 'utf8');

    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('renders guide screenshots with accessible captions and lazy loading', () => {
    const screenshot = readFileSync(
      'packages/ui/src/components/GuideScreenshot.astro',
      'utf8',
    );

    expect(screenshot).toContain('alt: string');
    expect(screenshot).toContain('caption: string');
    expect(screenshot).toContain('<figure');
    expect(screenshot).toContain('loading="lazy"');
    expect(screenshot).toContain('decoding="async"');
    expect(screenshot).toContain('aria-describedby={captionId}');
    expect(screenshot).toContain('<figcaption id={captionId}>');
  });
});
