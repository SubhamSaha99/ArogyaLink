import * as fs from 'fs/promises';

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    // Ignore if file doesn't exist
    if (err.code !== 'ENOENT') {
      console.error(`Failed to delete file: ${filePath}`, err.message ?? err.code ?? error);
    }
  }
}
