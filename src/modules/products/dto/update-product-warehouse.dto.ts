import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductWarehouse {
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
}
