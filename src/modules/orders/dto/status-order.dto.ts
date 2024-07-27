import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderPayStatus } from 'src/common/enums/order-pay-status.enum';
import { OrderStatus } from 'src/common/enums/order-status.enum';

export class ChangeStatusOrderDto {
  @ApiProperty({
    example: OrderStatus.PENDING,
    enum: OrderStatus,
    required: false,
  })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class ChangePayStatusOrderDto {
    @ApiProperty({
      example: OrderPayStatus.PENDING,
      enum: OrderPayStatus,
      required: false,
    })
    @IsNotEmpty()
    @IsEnum(OrderPayStatus)
    payStatus: OrderPayStatus;
  }
