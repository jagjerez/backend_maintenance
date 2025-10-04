import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileStorageProvider, FileUploadResult, MulterFile } from '../interfaces/file-storage.interface';
import { MinioStorageService } from './minio-storage.service';
import { VercelStorageService } from './vercel-storage.service';

@Injectable()
export class FileStorageService implements FileStorageProvider {
  private readonly logger = new Logger(FileStorageService.name);
  private provider: FileStorageProvider;

  constructor(
    private configService: ConfigService,
    private minioStorageService: MinioStorageService,
    private vercelStorageService: VercelStorageService,
  ) {
    this.initializeProvider();
  }

  private initializeProvider() {
    const storageType = this.configService.get<string>('storage.type');
    
    switch (storageType) {
      case 'minio':
        this.provider = this.minioStorageService;
        this.logger.log('Using MinIO storage provider');
        break;
      case 'vercel':
        this.provider = this.vercelStorageService;
        this.logger.log('Using Vercel storage provider');
        break;
      default:
        this.provider = this.minioStorageService;
        this.logger.warn(`Unknown storage type: ${storageType}, defaulting to MinIO`);
    }
  }

  async uploadFile(
    file: MulterFile,
    folder?: string,
  ): Promise<FileUploadResult> {
    return this.provider.uploadFile(file, folder);
  }

  async deleteFile(key: string): Promise<void> {
    return this.provider.deleteFile(key);
  }

  async getFileUrl(key: string): Promise<string> {
    return this.provider.getFileUrl(key);
  }
}

