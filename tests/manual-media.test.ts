import { existsSync, readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface ManualCapture {
  portal: 'operativo' | 'administrativo';
  manual: string;
  image: string;
}

const captures: ManualCapture[] = [
  {
    portal: 'operativo',
    manual: 'pantallas/finanzas.mdx',
    image: '/media/guides/finanzas/resumen-financiero.png',
  },
  {
    portal: 'operativo',
    manual: 'pantallas/materiales.mdx',
    image: '/media/guides/materiales/acceso-materiales.png',
  },
  {
    portal: 'operativo',
    manual: 'pantallas/miembros.mdx',
    image: '/media/guides/membresia/miembros-del-club.png',
  },
  {
    portal: 'administrativo',
    manual: 'finanzas/finanzas-clubes.mdx',
    image: '/media/guides/finanzas/movimientos-por-club.png',
  },
  {
    portal: 'administrativo',
    manual: 'materiales/solicitudes-materiales.mdx',
    image: '/media/guides/materiales/solicitudes-materiales.png',
  },
  {
    portal: 'administrativo',
    manual: 'clubes/solicitudes.mdx',
    image: '/media/guides/membresia/solicitudes-membresia.png',
  },
  {
    portal: 'operativo',
    manual: 'pantallas/ayuda-soporte.mdx',
    image: '/media/guides/soporte/centro-ayuda.png',
  },
  {
    portal: 'operativo',
    manual: 'pantallas/recursos.mdx',
    image: '/media/guides/recursos/biblioteca-recursos.png',
  },
  {
    portal: 'operativo',
    manual: 'pantallas/logros.mdx',
    image: '/media/guides/logros/mis-logros.png',
  },
  {
    portal: 'administrativo',
    manual: 'clubes/campamentos.mdx',
    image: '/media/guides/camporees/administracion-camporees.png',
  },
  {
    portal: 'administrativo',
    manual: 'materiales/recursos.mdx',
    image: '/media/guides/recursos/gestion-recursos.png',
  },
  {
    portal: 'administrativo',
    manual: 'configuracion/logros.mdx',
    image: '/media/guides/logros/configuracion-logros.png',
  },
];

describe('manual screenshots', () => {
  it('keeps every approved screenshot connected to its manual', () => {
    const invalid = captures.flatMap(({ portal, manual, image }) => {
      const manualPath = `apps/${portal}/src/content/docs/${manual}`;
      const source = readFileSync(manualPath, 'utf8');
      const errors: string[] = [];

      if (!source.includes("@sacdia/docs-ui/components/GuideScreenshot")) {
        errors.push('missing GuideScreenshot import');
      }
      if (!source.includes(`src="${image}"`)) {
        errors.push(`missing ${image} reference`);
      }

      return errors.map((error) => ({ manualPath, error }));
    });

    expect(invalid, JSON.stringify(invalid, null, 2)).toEqual([]);
  });

  it('resolves every screenshot to a non-empty PNG in the correct portal', () => {
    const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const invalid = captures.flatMap(({ portal, image }) => {
      const assetPath = `apps/${portal}/public${image}`;
      if (!existsSync(assetPath)) return [{ assetPath, error: 'missing file' }];

      const signature = readFileSync(assetPath).subarray(0, 8);
      const errors: string[] = [];
      if (!signature.equals(pngSignature)) errors.push('not a PNG');
      if (statSync(assetPath).size < 10_000) errors.push('image is unexpectedly small');
      return errors.map((error) => ({ assetPath, error }));
    });

    expect(invalid, JSON.stringify(invalid, null, 2)).toEqual([]);
  });
});
