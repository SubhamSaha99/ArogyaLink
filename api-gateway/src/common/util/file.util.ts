import * as fs from 'fs/promises';

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    // Ignore if file doesn't exist
    if (error.code !== 'ENOENT') {
      console.error(`Failed to delete file: ${filePath}`, error);
    }
  }
}