import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterKeywordPostDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  code?: string;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  pageSize?: number;
}
