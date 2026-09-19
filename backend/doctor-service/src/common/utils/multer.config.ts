import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import * as fs from 'fs';

interface MulterOptions {
  allowedMimeTypes?: RegExp;
  maxSize?: number;
}

export const multerConfig = ({
  allowedMimeTypes = /^image\/(jpeg|jpg|png|webp)$/,
  maxSize = 5 * 1024 * 1024,
}: MulterOptions) => ({
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './uploads/temp';

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      cb(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),

  fileFilter: (req: any, file: Express.Multer.File, cb: Function) => {
    if (!allowedMimeTypes.test(file.mimetype)) {
      return cb(new BadRequestException('Invalid file type'), false);
    }

    cb(null, true);
  },

  limits: {
    fileSize: maxSize,
  },
});
