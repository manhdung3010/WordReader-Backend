import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthPayloadDto {
  @ApiProperty({ example: 'dungdz' })
  @IsString()
  identifier: string; // Can be username or email

  @ApiProperty({ example: '123456' })
  @IsString()
  password: string;
}
