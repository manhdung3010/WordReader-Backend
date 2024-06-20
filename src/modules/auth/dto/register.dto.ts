import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { Gender } from 'src/common/enums/gender.enum';

export class RegisterDto {
  @ApiProperty({ example: 'string' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'string' })
  @MinLength(6)
  @IsString()
  password: string;

  @ApiProperty({ example: 'string@gmail.com' })
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'string' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'string' })
  @IsOptional()
  @IsPhoneNumber(null)
  phoneNumber?: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    type: Date,
    example: '2024-04-18',
  })
  date: Date;

  @IsNotEmpty()
  @ApiProperty({ example: 'string' })
  @IsOptional()
  @IsString()
  address?: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'male' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
