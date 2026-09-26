import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { IStorageService, StoredFile } from './storage.interface.js';
import { env } from '../../config/env.js';

export class LocalStorageAdapter implements IStorageService {
  private baseDir: string;

  constructor(baseDir: string = env.UPLOAD_DIR) {
    this.baseDir = path.resolve(baseDir);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async saveFile(buffer: Buffer, originalFilename: string, mimeType: string, folder = 'media'): Promise<StoredFile> {
    const ext = path.extname(originalFilename).toLowerCase();
    const hash = crypto.randomBytes(16).toString('hex');
    const safeFilename = `${Date.now()}-${hash}${ext}`;
    
    const targetFolder = path.join(this.baseDir, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const fullFilePath = path.join(targetFolder, safeFilename);
    await fs.promises.writeFile(fullFilePath, buffer);

    const relativeStoragePath = path.posix.join(folder, safeFilename);
    const url = `/uploads/${relativeStoragePath}`;

    return {
      url,
      storagePath: relativeStoragePath,
      filename: safeFilename,
      size: buffer.length,
      mimeType
    };
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.baseDir, storagePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting file at ${storagePath}:`, error);
      return false;
    }
  }

  getUrl(storagePath: string): string {
    return `/uploads/${storagePath.replace(/\\/g, '/')}`;
  }
}
