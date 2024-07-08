import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    example: 'string',
  })
  name: string;

  @ApiProperty({
    example: 'string',
  })
  content: string;

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
  thumbnail: string;

  @ApiProperty({
    example: [],
    isArray: true,
  })
  image: string[];

  @ApiProperty({
    example: [],
    isArray: true,
    required: false,
  })
  keywords?: number[];

  @ApiProperty({
    example: [],
    isArray: true,
    required: false,
  })
  categories?: number[];

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
