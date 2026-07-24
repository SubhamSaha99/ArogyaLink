import * as fs from 'fs/promises';
import * as path from 'path';

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
