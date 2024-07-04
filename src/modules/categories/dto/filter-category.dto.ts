import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterCategoryDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  url?: string;

  @ApiPropertyOptional({ type: Boolean })
  display?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  homeDisplay?: boolean;
  
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  pageSize?: number;
}
