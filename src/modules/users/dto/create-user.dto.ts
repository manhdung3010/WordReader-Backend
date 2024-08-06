import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsDateString,
  IsEnum,
  MinLength,
} from 'class-validator';
import { Gender } from 'src/common/enums/gender.enum';
import { Role } from 'src/common/enums/role.enum';
import { UserStatus } from 'src/common/enums/user-status.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'password123' })
  @MinLength(6)
  @IsString()
  password: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsPhoneNumber(null)
  phoneNumber?: string;

  @ApiProperty({
    type: Date,
    example: '2024-04-18',
  })
  @IsDateString()
  date: Date;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'male', enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ example: 'active', enum:  UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ example: 'USER', enum: Role, required: false })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
