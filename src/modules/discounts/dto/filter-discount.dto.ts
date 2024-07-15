import { ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from 'src/common/enums/discount.enum';
import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDate,
  IsString,
} from 'class-validator';

export class FilterDiscountDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ enum: DiscountType, enumName: 'DiscountType' })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  display?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minPurchase?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  startTime?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  endTime?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pageSize?: number;
}
