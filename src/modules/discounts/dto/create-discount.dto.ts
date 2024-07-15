import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsString, IsDate } from 'class-validator';
import { DiscountType } from 'src/common/enums/discount.enum';

export class CreateDiscountDto {
  @ApiProperty({
    example: 'string',
    description: 'The name of the discount',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'string',
    description: 'The code of the discount',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    example: true,
    description: 'Whether the discount is active or not',
  })
  @IsNotEmpty()
  @IsBoolean()
  active: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether the discount should be displayed or not',
  })
  @IsNotEmpty()
  @IsBoolean()
  display: boolean;

  @ApiProperty({ example: 'percentage', enum: DiscountType, required: false })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;



  @ApiProperty({
    example: 0,
    description: 'The price of the discount',
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 0,
    description: 'The usage limit of the discount',
  })
  @IsNotEmpty()
  @IsNumber()
  usageLimit: number;

  @ApiProperty({
    example: 0,
    description: 'The maximum discount amount allowed',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  maxDiscount?: number;

  @ApiProperty({
    example: 0,
    description: 'The minimum purchase amount required to apply the discount',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  minPurchase?: number;

  @ApiProperty({
    example: '2024-12-31T23:59:59Z',
    description: 'The start time when the discount becomes valid',
  })
  @IsNotEmpty()
  @IsDate()
  startTime: Date;

  @ApiProperty({
    example: '2025-01-31T23:59:59Z',
    description: 'The end time when the discount expires',
  })
  @IsNotEmpty()
  @IsDate()
  endTime: Date;
}
