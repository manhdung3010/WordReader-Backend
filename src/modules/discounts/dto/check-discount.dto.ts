import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CheckDiscountDto {
  @ApiProperty({
    example: 'string',
    description: 'The code of the discount',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    example: [
      {
        productId: 1,
        quantity: 2,
      },
    ],
    isArray: true,
    required: false,
    description: 'List of products with their quantities',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductsDto)
  products?: ProductsDto[];
}


class ProductsDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the product',
  })
  @IsInt()
  productId: number;

  @ApiProperty({
    example: 1,
    description: 'The quantity of the product',
  })
  @IsInt()
  quantity: number;
}
