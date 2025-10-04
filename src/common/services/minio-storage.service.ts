import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { FileStorageProvider, FileUploadResult, MulterFile } from '../interfaces/file-storage.interface';

@Injectable()
export class MinioStorageService implements FileStorageProvider {
  private readonly logger = new Logger(MinioStorageService.name);
  private minioClient: Minio.Client;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('storage.minio.endpoint') || 'localhost',
      port: this.configService.get<number>('storage.minio.port') || 9000,
      useSSL: this.configService.get<boolean>('storage.minio.useSSL') || false,
      accessKey: this.configService.get<string>('storage.minio.accessKey') || 'minioadmin',
      secretKey: this.configService.get<string>('storage.minio.secretKey') || 'minioadmin',
    });
  }

  async uploadFile(
    file: MulterFile,
    folder = 'uploads',
  ): Promise<FileUploadResult> {
    try {
      const bucketName = this.configService.get<string>('storage.minio.bucketName') || 'app-maintenance';
      const fileName = `${folder}/${Date.now()}-${file.originalname}`;
      
      // Ensure bucket exists
      const bucketExists = await this.minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(bucketName, 'us-east-1');
      }

      // Upload file
      await this.minioClient.putObject(
        bucketName,
        fileName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      const url = await this.getFileUrl(fileName);

      return {
        url,
        key: fileName,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Error uploading file to MinIO:', error);
      throw new Error('Failed to upload file');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const bucketName = this.configService.get<string>('storage.minio.bucketName') || 'app-maintenance';
      await this.minioClient.removeObject(bucketName, key);
    } catch (error) {
      this.logger.error('Error deleting file from MinIO:', error);
      throw new Error('Failed to delete file');
    }
  }

  async getFileUrl(key: string): Promise<string> {
    try {
      const bucketName = this.configService.get<string>('storage.minio.bucketName') || 'app-maintenance';
      const endpoint = this.configService.get<string>('storage.minio.endpoint') || 'localhost';
      const port = this.configService.get<number>('storage.minio.port') || 9000;
      const useSSL = this.configService.get<boolean>('storage.minio.useSSL') || false;
      
      const protocol = useSSL ? 'https' : 'http';
      return `${protocol}://${endpoint}:${port}/${bucketName}/${key}`;
    } catch (error) {
      this.logger.error('Error getting file URL from MinIO:', error);
      throw new Error('Failed to get file URL');
    }
  }
}

