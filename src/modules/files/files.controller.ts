import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Get,
  Param,
  Res,
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
import { Response } from 'express'; // Ensure Response type is imported

import { AuthAdmin } from 'src/common/decorators/http.decorators';
import * as multer from 'multer'; // Import multer

@ApiTags('Api Uploads')
@Controller('/api/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @AuthAdmin()
  @Post('/uploads')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: FilesUploadedDto,
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: multer.memoryStorage(), // Use memory storage
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.filesService.saveMultipleFiles(files);
  }

  @Get(':filename')
  @ApiOperation({ summary: 'View a file' })
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const fileUrl = await this.filesService.getFile(filename);
    res.redirect(fileUrl); // Redirect to the Cloudinary URL
  }

  @AuthAdmin()
  @Delete(':filename')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'filename', description: 'Name of the file to delete' })
  async deleteFile(@Param('filename') filename: string) {
    return this.filesService.deleteFile(filename);
  }
}
