import { ApiProperty } from '@nestjs/swagger';

export class CreateKeywordDto {
  @ApiProperty({
    example: 'string',
  })
  name: string;

  @ApiProperty({
    example: 'string',
  })
  code: string;
}
