import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum PostSortOption {
  LATEST = 'latest',
  POPULAR = 'popular',
}

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

  @ApiPropertyOptional({ enum: PostSortOption, description: 'Sort by latest or most popular posts' })
  @IsOptional()
  @IsEnum(PostSortOption)
  sortBy?: PostSortOption;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  pageSize?: number;
}
