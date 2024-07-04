import { ApiProperty } from "@nestjs/swagger";
import { IsDateString } from "class-validator";

export class CreateAuthorDto {
  @ApiProperty({
    example: 'string',
  })
  name: string;

  @ApiProperty({
    type: Date,
    example: '2024-04-18',
  })
  @IsDateString()
  date: Date;

  @ApiProperty({
    example: 'string',
  })
  nationality: string;

  @ApiProperty({
    example: 'string',
  })
  biography: string;

  @ApiProperty({
    example: 'string',
  })
  image: string;

}
