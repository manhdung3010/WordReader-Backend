import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressType } from 'src/common/enums/address.enum';

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

class ShippingInfo {
  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the recipient',
  })
  name: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the recipient',
  })
  phone: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'Full address of the recipient',
  })
  address: string;

  @ApiProperty({
    example: 'Main Street',
    description: 'Street name of the address',
  })
  streetName: string;

  @ApiProperty({
    enum: AddressType,
    example: AddressType.HOME,
    description: 'Type of the address',
  })
  addressType: AddressType;
}

export class CreateOrderDto {
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

  @ApiProperty({
    required: false,
  })
  shipping?: ShippingInfo;
}
