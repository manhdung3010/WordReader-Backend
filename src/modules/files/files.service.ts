import { Injectable } from '@nestjs/common';
import { UploadedFileDto } from './dto/uploaded-file.dto';
import { v2 as cloudinaryV2 } from 'cloudinary';
import * as path from 'path'; // Ensure path is imported

@Injectable()
export class FilesService {
  constructor() {
    cloudinaryV2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async saveMultipleFiles(files: Array<Express.Multer.File>): Promise<any> {
    const allowedExtensions = [
      '.png',
      '.jpg',
      '.jpeg',
      '.webp',
      '.gif',
      '.bmp',
      '.tiff',
      '.svg',
    ];
    const uploadedFiles: UploadedFileDto[] = [];

    for (const file of files) {
      const fileExtName = path.extname(file.originalname);
      if (!allowedExtensions.includes(fileExtName)) {
        throw new Error('Invalid file extension');
      }

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinaryV2.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: process.env.CLOUDINARY_CLOUD_FOLDER, // Specify the folder
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );
        uploadStream.end(file.buffer); // Use file.buffer to upload the file
      });

      const uploadedFile: UploadedFileDto = {
        file_name: uploadResult.public_id,
        size: file.size,
        url: uploadResult.secure_url,
      };

      uploadedFiles.push(uploadedFile);
    }

    return {
      data: {
        uploadedFiles,
      },
    };
  }

  async getFile(publicId: string): Promise<string> {
    try {
      const resource = await cloudinaryV2.api.resource(publicId);
      return resource.secure_url;
    } catch (error) {
      throw new Error(`File ${publicId} not found`);
    }
  }

  async deleteFile(publicId: string): Promise<string> {
    try {
      await cloudinaryV2.uploader.destroy(publicId);
      return `${publicId} has been successfully removed`;
    } catch (error) {
      throw new Error(`File ${publicId} not found`);
    }
  }
}
