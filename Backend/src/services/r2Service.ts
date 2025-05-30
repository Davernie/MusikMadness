import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_CONFIG, getR2FileUrl, generateSongKey, isR2Configured } from '../config/r2';
import { v4 as uuidv4 } from 'uuid';

export class R2Service {
  
  /**
   * Upload a file buffer to R2
   */
  static async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    if (!isR2Configured || !r2Client) {
      throw new Error('R2 is not configured. Please set up R2 environment variables.');
    }

    try {
      const command = new PutObjectCommand({
        Bucket: R2_CONFIG.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
        // Make file publicly readable if you want direct public access
        // ACL: 'public-read', // Note: R2 handles public access differently than S3
      });

      await r2Client.send(command);
      return getR2FileUrl(key);
    } catch (error) {
      console.error('Error uploading file to R2:', error);
      throw new Error(`Failed to upload file to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload a song file specifically
   */
  static async uploadSong(
    buffer: Buffer,
    tournamentId: string,
    userId: string,
    originalFilename: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<{ url: string; key: string }> {
    const key = generateSongKey(tournamentId, userId, originalFilename);
    
    const songMetadata = {
      tournamentId,
      userId,
      originalFilename,
      uploadedAt: new Date().toISOString(),
      ...metadata,
    };

    const url = await this.uploadFile(buffer, key, contentType, songMetadata);
    return { url, key };
  }

  /**
   * Delete a file from R2
   */
  static async deleteFile(key: string): Promise<void> {
    if (!isR2Configured || !r2Client) {
      throw new Error('R2 is not configured. Please set up R2 environment variables.');
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: R2_CONFIG.bucketName,
        Key: key,
      });

      await r2Client.send(command);
    } catch (error) {
      console.error('Error deleting file from R2:', error);
      throw new Error(`Failed to delete file from R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a presigned URL for direct download (useful for streaming)
   */
  static async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!isR2Configured || !r2Client) {
      throw new Error('R2 is not configured. Please set up R2 environment variables.');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: R2_CONFIG.bucketName,
        Key: key,
      });

      return await getSignedUrl(r2Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the public URL for a file (if R2 bucket has public access enabled)
   */
  static getPublicUrl(key: string): string {
    return getR2FileUrl(key);
  }

  /**
   * Check if a file exists in R2
   */
  static async fileExists(key: string): Promise<boolean> {
    if (!isR2Configured || !r2Client) {
      return false;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: R2_CONFIG.bucketName,
        Key: key,
      });

      await r2Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(key: string) {
    if (!isR2Configured || !r2Client) {
      throw new Error('R2 is not configured. Please set up R2 environment variables.');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: R2_CONFIG.bucketName,
        Key: key,
      });

      const response = await r2Client.send(command);
      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata,
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 