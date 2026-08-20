import { describe, expect, it } from 'vitest';
import { PORTALS } from './portals';

describe('PORTALS', () => {
  it('defines the three documentation audiences in order', () => {
    expect(Object.keys(PORTALS)).toEqual(['operativo', 'administrativo', 'tecnico']);
  });

  it('keeps only the operational portal public and indexable', () => {
    expect(PORTALS.operativo).toMatchObject({
      access: 'public',
      robots: 'index',
    });
    expect(PORTALS.administrativo).toMatchObject({
      access: 'private',
      robots: 'noindex',
    });
    expect(PORTALS.tecnico).toMatchObject({
      access: 'private',
      robots: 'noindex',
    });
  });

  it('assigns distinct audiences and environment keys', () => {
    const audiences = new Set(Object.values(PORTALS).map((portal) => portal.audience));
    const envKeys = new Set(Object.values(PORTALS).map((portal) => portal.domainEnv));

    expect(audiences).toHaveLength(3);
    expect(envKeys).toHaveLength(3);
  });
});
