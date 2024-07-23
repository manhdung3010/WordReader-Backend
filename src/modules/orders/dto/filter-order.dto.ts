import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate } from 'class-validator';
import { OrderPayStatus } from 'src/common/enums/order-pay-status.enum';
import { OrderStatus } from 'src/common/enums/order-status.enum';

export class FilterOrderDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: OrderPayStatus })
  payStatus?: OrderPayStatus;

  @ApiPropertyOptional()
  priceFrom?: number;

  @ApiPropertyOptional()
  priceTo?: number;

  @ApiPropertyOptional()
  userId?: number;

  @ApiPropertyOptional()
  @IsDate()
  createAtFrom?: Date;

  @ApiPropertyOptional()
  @IsDate()
  createAtTo?: Date;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  pageSize?: number;
}

export class FilterOrderByUserDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: OrderPayStatus })
  payStatus?: OrderPayStatus;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  pageSize?: number;
}
