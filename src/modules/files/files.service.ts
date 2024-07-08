import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UploadedFileDto } from './dto/uploaded-file.dto';
import * as fs from 'fs';
import * as path from 'path';
import { UPLOADS_DIRECTORY } from './constants/files.enum';

@Injectable()
export class FilesService {
  async saveMultipleFiles(files: Array<Express.Multer.File>): Promise<any> {
    const allowedExtensions = ['.png', '.jpg'];
    const uploadDir = './uploads';

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
      console.log('upload dir success');
    }

    const uploadedFiles: UploadedFileDto[] = [];

    for (const file of files) {
      const fileExtName = path.extname(file.originalname);
      if (!allowedExtensions.includes(fileExtName)) {
        throw new BadRequestException('Invalid file extension');
      }

      const uploadedFile: UploadedFileDto = {
        file_name: file.filename,
        size: file.size,
        url: `${process.env.FILE_URL}/${file.filename}`,
      };

      uploadedFiles.push(uploadedFile);
    }

    return {
      data: {
        uploadedFiles,
      },
    };
  }

  async getFile(filename: string): Promise<string> {
    const filePath = path.resolve(__dirname, UPLOADS_DIRECTORY, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File ${filename} not found`);
    }
    return filePath;
  }

  async deleteFile(filename: string): Promise<string> {
    const filePath = path.resolve(__dirname, UPLOADS_DIRECTORY, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File ${filename} not found`);
    }

    fs.unlinkSync(filePath);

    return `${filename} has been successfully removed`;
  }
}
