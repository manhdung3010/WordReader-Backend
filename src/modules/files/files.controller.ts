import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Get,
  Param,
  Res,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { FilesService } from './files.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FilesUploadedDto } from './dto/files-uploaded.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { Response } from 'express'; // Ensure Response type is imported

import { FilesMessage } from './constants/files-message.enum';
import { AuthAdmin } from 'src/common/decorators/http.decorators';

@ApiTags('Api Uploads')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @AuthAdmin()
  @Post('uploads')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: FilesUploadedDto,
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = crypto.randomBytes(4).toString('hex');
          cb(null, `${randomName}-${file.originalname}`);
        },
      }),
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.filesService.saveMultipleFiles(files);
  }

  @Get('uploads/:filename')
  @ApiOperation({ summary: 'View a file' })
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = await this.filesService.getFile(filename);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException(FilesMessage.NOT_FOUND);
    }
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }


  @AuthAdmin()
  @Delete('uploads/:filename')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'filename', description: 'Name of the file to delete' })
  async deleteFile(@Param('filename') filename: string) {
    return this.filesService.deleteFile(filename);
  }
}
