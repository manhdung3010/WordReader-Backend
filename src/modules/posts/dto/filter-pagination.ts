import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterPaginationDto {
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  pageSize?: number;
}
