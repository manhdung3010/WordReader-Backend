import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterCategoryPostsDto {
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
