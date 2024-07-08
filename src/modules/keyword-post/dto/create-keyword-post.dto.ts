import { ApiProperty } from "@nestjs/swagger";

export class CreateKeywordPostDto {
  @ApiProperty({
    example: 'string',
  })
  name: string;

  @ApiProperty({
    example: 'string',
  })
  code: string;
}
