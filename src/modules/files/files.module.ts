import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './uploads',
      }),
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
