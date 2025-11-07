import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from '@/config/envVars';
import { logger } from '@/utils/logger';

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
}

export class ImageService {
  static async uploadImage(file: Express.Multer.File, folder: string = 'general'): Promise<UploadResult> {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [
              { width: 1000, height: 1000, crop: 'limit' },
              { quality: 'auto' },
            ],
          },
          (error, result) => {
            if (error) {
              logger.error('Cloudinary upload error:', error);
              reject(new Error('Failed to upload image'));
            } else if (result) {
              resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
                url: result.url,
              });
            } else {
              reject(new Error('Upload result is undefined'));
            }
          }
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      logger.error('Image upload service error:', error);
      throw new Error('Image upload failed');
    }
  }

  static async uploadProfilePicture(file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadImage(file, 'profile-pictures');
  }

  static async uploadBanner(file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadImage(file, 'banners');
  }

  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      logger.error('Image deletion error:', error);
      throw new Error('Failed to delete image');
    }
  }
}