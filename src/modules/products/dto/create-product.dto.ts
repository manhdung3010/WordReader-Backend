import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { StatusProduct } from 'src/common/enums/product-status.enum';

export class CreateProductDto {
  @ApiProperty({
    example: 'string',
  })
  name: string;

  @ApiProperty({
    example: 'string',
  })
  code: string;

  @ApiProperty({
    example: 'string',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'string',
  })
  url: string;

  @ApiProperty({
    example: true,
  })
  display: boolean;

  @ApiProperty({ example: 'IN_STOCK', enum: StatusProduct, required: false })
  @IsOptional()
  @IsEnum(StatusProduct)
  status?: StatusProduct;

  @ApiProperty({
    example: 'string',
  })
  avatar: string;

  @ApiProperty({
    example: false,
    description: 'Product chosen by our experts',
  })
  chosenByExperts: boolean;

  @ApiProperty({
    example: 0,
  })
  price: number;

  @ApiProperty({
    example: 0,
  })
  perDiscount: number;

  @ApiProperty({
    example: [],
    isArray: true,
  })
  image: string[];

  @ApiProperty({
    example: [
      {
        name: 'string',
        content: 'string',
      },
    ],
    isArray: true,
    required: false,
  })
  information?: any[];

  @ApiProperty({
    example: [],
    isArray: true,
    required: false,
  })
  categories?: number[];

  @ApiProperty({
    example: {
      quantityInStock: 0,
      quantityInUse: 0,
    },
    required: false,
  })
  productWarehouse?: {
    quantityInStock: number;
    quantityInUse: number;
  };

  @ApiProperty({
    example: {
      flashSaleStartTime: '2024-01-01T00:00:00Z',
      flashSaleEndTime: '2024-01-01T23:59:59Z',
      flashSaleDiscount: 0,
    },
    required: false,
  })
  flashSale?: {
    flashSaleStartTime: Date;
    flashSaleEndTime: Date;
    flashSaleDiscount: number;
    flashSalePrice: number;
  };

  @ApiProperty({
    example: [],
    isArray: true,
    required: false,
  })
  keywords?: number[];

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
