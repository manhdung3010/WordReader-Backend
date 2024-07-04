import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterAuthorDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  nationality?: string;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  pageSize?: number;
}
