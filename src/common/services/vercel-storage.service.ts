import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileStorageProvider, FileUploadResult, MulterFile } from '../interfaces/file-storage.interface';

@Injectable()
export class VercelStorageService implements FileStorageProvider {
  private readonly logger = new Logger(VercelStorageService.name);
  private readonly vercelApiUrl = 'https://api.vercel.com';

  constructor(private configService: ConfigService) {}

  async uploadFile(
    file: MulterFile,
    folder = 'uploads',
  ): Promise<FileUploadResult> {
    try {
      const accessToken = this.configService.get<string>('storage.vercel.accessToken') || '';
      const projectId = this.configService.get<string>('storage.vercel.projectId') || '';
      
      // Convert file to base64
      const base64File = file.buffer.toString('base64');
      const fileName = `${folder}/${Date.now()}-${file.originalname}`;

      // Upload to Vercel Blob Storage
      const response = await fetch(`${this.vercelApiUrl}/v1/blob`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: fileName,
          data: base64File,
          contentType: file.mimetype,
        }),
      });

      if (!response.ok) {
        throw new Error(`Vercel API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        url: result.url,
        key: fileName,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Error uploading file to Vercel:', error);
      throw new Error('Failed to upload file to Vercel');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const accessToken = this.configService.get<string>('storage.vercel.accessToken') || '';
      
      const response = await fetch(`${this.vercelApiUrl}/v1/blob/${key}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Vercel API error: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error('Error deleting file from Vercel:', error);
      throw new Error('Failed to delete file from Vercel');
    }
  }

  async getFileUrl(key: string): Promise<string> {
    // Vercel blob URLs are already public, so we can return the key as URL
    return `https://blob.vercel-storage.com/${key}`;
  }
}

