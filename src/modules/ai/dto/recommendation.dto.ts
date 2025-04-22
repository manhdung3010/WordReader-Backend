import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RecommendationQueryDto {
  @ApiProperty({ description: 'Product ID to get recommendations for' })
  product_id: number;

  @ApiProperty({
    description: 'Number of recommendations to return',
    default: 5,
  })
  k?: number;
}

export class BatchRecommendationDto {
  @ApiProperty({
    description: 'List of product IDs',
    type: [Number],
    example: [1, 2, 3],
  })
  product_ids: number[];

  @ApiProperty({
    description: 'Number of recommendations per product',
    default: 5,
  })
  k?: number;
}

export class RecommendationsRefavoritesDto {
  @ApiProperty({
    description: 'List of product IDs',
    type: [Number],
    example: [1, 2, 3],
  })
  favorite_ids: number[];

  @ApiProperty({
    description: 'Number of recommendations per product',
    default: 5,
  })
  k?: number;
}

export class UpdateRecommendationDto {
  @ApiProperty({
    description: 'Product ID',
    example: 111,
  })
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'Product name',
    example: 'Product Name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Product Description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
