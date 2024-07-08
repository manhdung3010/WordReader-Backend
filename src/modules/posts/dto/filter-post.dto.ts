import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterPostDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  url?: string;

  @ApiPropertyOptional()
  author?: string;

  @ApiPropertyOptional({ type: Boolean })
  homeDisplay?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  display?: boolean;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  pageSize?: number;
}
