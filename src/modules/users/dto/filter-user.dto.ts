import { Gender } from 'src/common/enums/gender.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';

export class FilterUserDriverDto {
  @ApiPropertyOptional()
  username?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional({ enum: Gender, enumName: 'Gender' })
  gender?: Gender;

  @ApiPropertyOptional({ enum: Role, enumName: 'Role' })
  role?: Role;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  pageSize?: number;
}
