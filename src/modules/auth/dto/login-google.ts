import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ example: 'string' })
  @IsString()
  googleId: string;

  @ApiProperty({ example: 'string' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'string' })
  @IsString()
  newPassword: string;

  @ApiProperty({ example: 'string' })
  @IsString()
  displayName: string;

  @ApiProperty({ example: 'string' })
  @IsString()
  photo: string;

  @ApiProperty({ example: 'string' })
  @IsString()
  username: string;
}
