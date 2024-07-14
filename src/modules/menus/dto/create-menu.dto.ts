import { ApiProperty } from "@nestjs/swagger";

export class CreateMenuDto {
  @ApiProperty({
    example: 'string',
  })
  name: string;

  @ApiProperty({
    example: 'string',
  })
  description: string;

  @ApiProperty({
    example: 'string',
  })
  url: string;

  @ApiProperty({
    example: true,
  })
  display: boolean;

  @ApiProperty({
    example: true,
  })
  homeDisplay: boolean;

  @ApiProperty({
    example: 'string',
  })
  image: string;

  @ApiProperty({
    example: [],
    isArray: true,
  })
  parentIds: number[];

  @ApiProperty({
    example: {
      title: 'string',
      description: 'string',
    },
    required: false,
  })
  seo?: {
    title: string;
    description: string;
  };
}
