export interface FileUploadResult {
  url: string;
  key: string;
  size: number;
  mimetype: string;
}

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface FileStorageProvider {
  uploadFile(file: MulterFile, folder?: string): Promise<FileUploadResult>;

  deleteFile(key: string): Promise<void>;

  getFileUrl(key: string): Promise<string>;
}
