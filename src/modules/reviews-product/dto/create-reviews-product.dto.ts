import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewsProductDto {
  @ApiProperty({
    example: 0,
  })
  productId: number;

  @ApiProperty({
    example: 'string',
  })
  name: string;

  @ApiProperty({
    example: 'string',
  })
  phone: string;

  @ApiProperty({
    example: 0,
  })
  star: number;

  @ApiProperty({
    example: 'string',
  })
  content: string;

  @ApiProperty({
    example: [],
    isArray: true,
  })
  image: string[];
}
