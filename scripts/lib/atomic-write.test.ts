import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { atomicWriteFile } from './atomic-write';

describe('atomicWriteFile', () => {
  it('creates missing directories before replacing the target', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'sacdia-docs-'));
    const target = path.join(root, 'nested', 'generated.mdx');

    await atomicWriteFile(target, async () => '# generated\n');

    await expect(readFile(target, 'utf8')).resolves.toBe('# generated\n');
  });

  it('preserves the valid file when rendering fails', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'sacdia-docs-'));
    const target = path.join(root, 'generated.mdx');
    await atomicWriteFile(target, async () => '# valid\n');

    await expect(atomicWriteFile(target, async () => {
      throw new Error('render failed');
    })).rejects.toThrow('render failed');
    await expect(readFile(target, 'utf8')).resolves.toBe('# valid\n');
  });
});
