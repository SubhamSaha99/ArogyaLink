import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * @description util function to move file
 * @param source 
 * @param destinationFolder 
 * @returns string
 */
export async function moveFile(source: string, destinationFolder: string) {
  const uploadDir = path.join(process.cwd(), 'uploads', destinationFolder);

  await fs.mkdir(uploadDir, {
    recursive: true,
  });

  const fileName = path.basename(source);
  const destination = path.join(uploadDir, fileName);
  await fs.rename(source, destination);
  return `${destinationFolder}/${fileName}`;
}

/**
 * @description util file to delete file
 * @param filePath 
 */
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
