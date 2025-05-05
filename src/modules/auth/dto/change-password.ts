import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'string' })
  @MinLength(6)
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'string' })
  @MinLength(6)
  @IsString()
  newPassword: string;
}
