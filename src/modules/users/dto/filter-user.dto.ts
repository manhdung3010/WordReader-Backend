import { Gender } from 'src/common/enums/gender.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';
import { UserStatus } from 'src/common/enums/user-status.enum';

export class FilterUserDto {
  @ApiPropertyOptional()
  username?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional({ enum: Gender, enumName: 'Gender' })
  gender?: Gender;

  @ApiPropertyOptional({ enum: Role, enumName: 'Role' })
  role?: Role;

  @ApiPropertyOptional({ enum: UserStatus, enumName: 'Status' })
  status?: UserStatus;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  pageSize?: number;
}
