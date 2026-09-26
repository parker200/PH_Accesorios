import multer from 'multer';
import { BadRequestError } from '../errors/app-error.js';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm'
];

const storage = multer.memoryStorage();

export const uploadMedia = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 MB maximum
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new BadRequestError(
          `Invalid file format: ${file.mimetype}. Allowed formats: JPG, PNG, WEBP, MP4, WEBM`
        )
      );
    }

    // Specific limit for images
    if (file.mimetype.startsWith('image/') && file.size > 5 * 1024 * 1024) {
      return cb(new BadRequestError('Image size exceeds limit of 5MB'));
    }

    cb(null, true);
  }
});
