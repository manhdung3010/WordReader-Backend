import { ApiProperty } from '@nestjs/swagger';

export class UploadedFileDto {
  @ApiProperty()
  file_name: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  url: string;
}
