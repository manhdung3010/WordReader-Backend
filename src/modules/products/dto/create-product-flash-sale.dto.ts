import { ApiProperty } from '@nestjs/swagger';

export class CreateProductFlashSaleDto {
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
}
