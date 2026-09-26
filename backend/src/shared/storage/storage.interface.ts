export interface StoredFile {
  url: string;
  storagePath: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface IStorageService {
  saveFile(buffer: Buffer, originalFilename: string, mimeType: string, folder?: string): Promise<StoredFile>;
  deleteFile(storagePath: string): Promise<boolean>;
  getUrl(storagePath: string): string;
}
