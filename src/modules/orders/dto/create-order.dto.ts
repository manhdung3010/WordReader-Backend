import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsDecimal,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { OrderPayStatus } from 'src/common/enums/order-pay-status.enum';

class OrderItemDto {
  @ApiProperty({
    example: 1,
    description: 'Product ID',
  })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the product',
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    description: 'Order status',
  })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    enum: OrderPayStatus,
    example: OrderPayStatus.PENDING,
    description: 'Payment status of the order',
  })
  @IsNotEmpty()
  @IsEnum(OrderPayStatus)
  payStatus: OrderPayStatus;

  @ApiProperty({
    example: 200.5,
    description: 'Total price of the order',
  })
  @IsNotEmpty()
  @IsDecimal()
  totalPrice: number;

  @ApiProperty({
    example: 20.0,
    description: 'Discount price applied to the order',
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  discountPrice?: number;

  @ApiProperty({
    example: 'DISCOUNT123',
    description: 'Discount code applied to the order',
    required: false,
  })
  @IsOptional()
  @IsString()
  discountCode?: string;

  @ApiProperty({
    example: 'Additional notes for the order',
    description: 'Additional notes for the order',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    type: [OrderItemDto],
    description: 'List of order items',
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];
}
