import { describe, expect, it } from 'vitest';
import {
  adminPageToCoverage,
  mobileFeatureToCoverage,
  surfaceCoverageToCsv,
} from './surface-inventory';

describe('documentation surface inventory', () => {
  it('converts Next.js pages into administrative coverage rows', () => {
    expect(adminPageToCoverage('(dashboard)/dashboard/finances/page.tsx')).toMatchObject({
      surface: 'admin',
      module: 'finances',
      route_or_feature: '/dashboard/finances',
      manual_path: '/pantallas/dashboard/finances/',
      status: 'missing',
    });
    expect(adminPageToCoverage('(dashboard)/dashboard/clubs/[id]/page.tsx')?.route_or_feature)
      .toBe('/dashboard/clubs/[id]');
  });

  it('excludes routing fallbacks and non-page files', () => {
    expect(adminPageToCoverage('(dashboard)/dashboard/[...not-found]/page.tsx')).toBeNull();
    expect(adminPageToCoverage('(dashboard)/dashboard/layout.tsx')).toBeNull();
  });

  it('converts user-facing Flutter features into operational coverage rows', () => {
    expect(mobileFeatureToCoverage('finances')).toMatchObject({
      surface: 'app',
      module: 'finances',
      route_or_feature: 'finances',
      manual_path: '/pantallas/finances/',
      status: 'missing',
    });
    expect(mobileFeatureToCoverage('accessibility')).toBeNull();
  });

  it('serializes every required field', () => {
    const row = mobileFeatureToCoverage('profile');
    const csv = surfaceCoverageToCsv(row ? [row] : []);

    expect(csv).toContain('surface,module,route_or_feature,manual_path,processes,status,owner');
    expect(csv).toContain('app,profile,profile,/pantallas/profile/,,missing,documentation');
  });
});
