import { IStorageService } from './storage.interface.js';
import { LocalStorageAdapter } from './local-storage.adapter.js';

// Singleton instance of the storage adapter
// To migrate to S3 or Cloudinary, simply swap the instance here
export const storageService: IStorageService = new LocalStorageAdapter();

export * from './storage.interface.js';
export * from './local-storage.adapter.js';
