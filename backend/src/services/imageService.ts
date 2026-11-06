import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export interface ProcessedImage {
  buffer: Buffer;
  base64: string;
  mimeType: 'image/jpeg';
  width: number;
  height: number;
  sizeBytes: number;
}

export class ImageService {
  private static MAX_DIMENSION = 1280;
  private static MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

  /**
   * Validates and optimizes uploaded image buffer
   * Strips EXIF metadata for privacy, resizes to max dimension, and converts to optimized JPEG
   */
  public static async processImage(inputBuffer: Buffer): Promise<ProcessedImage> {
    if (inputBuffer.length > this.MAX_FILE_SIZE_BYTES) {
      throw new Error('Image exceeds 10MB size limit');
    }

    const metadata = await sharp(inputBuffer).metadata();

    if (!metadata.format || !['jpeg', 'jpg', 'png', 'webp', 'avif'].includes(metadata.format)) {
      throw new Error('Unsupported image format. Please submit JPG, PNG, or WebP.');
    }

    // Process image: strip metadata, resize, convert to clean JPEG
    const sharpInstance = sharp(inputBuffer)
      .rotate() // Auto-orient based on EXIF before stripping
      .resize({
        width: this.MAX_DIMENSION,
        height: this.MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        mozjpeg: true,
      });

    const optimizedBuffer = await sharpInstance.toBuffer();
    const processedMeta = await sharp(optimizedBuffer).metadata();

    return {
      buffer: optimizedBuffer,
      base64: optimizedBuffer.toString('base64'),
      mimeType: 'image/jpeg',
      width: processedMeta.width || 0,
      height: processedMeta.height || 0,
      sizeBytes: optimizedBuffer.length,
    };
  }

  /**
   * Save processed image to disk
   */
  public static async saveToFile(buffer: Buffer, filename: string): Promise<string> {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, buffer);
    return filePath;
  }
}
