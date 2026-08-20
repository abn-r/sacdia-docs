import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function atomicWriteFile(
  targetPath: string,
  render: () => string | Promise<string>,
): Promise<void> {
  const content = await render();
  const directory = path.dirname(targetPath);
  const temporaryPath = path.join(
    directory,
    `.${path.basename(targetPath)}.${process.pid}.${Date.now()}.tmp`,
  );

  await mkdir(directory, { recursive: true });
  try {
    await writeFile(temporaryPath, content, 'utf8');
    await rename(temporaryPath, targetPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}
