import { ApiProperty } from '@nestjs/swagger';


export class FilesUploadedDto {
   @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: any[];
}
