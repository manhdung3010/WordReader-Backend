import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum DeviceType {
  MOBILE = 'MOBILE',
  TABLET = 'TABLET',
  DESKTOP = 'DESKTOP',
}

export class LogViewDto {
  @ApiProperty({
    example: 'MOBILE',
    description: 'Thiết bị mà người dùng sử dụng để xem sản phẩm (MOBILE, TABLET, DESKTOP)',
    required: false,
    enum: DeviceType,
  })
  @IsOptional()
  @IsEnum(DeviceType)
  device?: DeviceType;

  @ApiProperty({
    example: 'Google',
    description: 'Nguồn truy cập (Google, Facebook, Direct, Other)',
    required: false,
  })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiProperty({
    example: 120,
    description: 'Thời gian xem sản phẩm (tính bằng giây)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiProperty({
    example: '12345',
    description: 'Mã sản phẩm đã được xem',
    required: true,
  })
  @IsString()
  productId: string;
}
