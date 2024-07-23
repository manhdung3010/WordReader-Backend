import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusProduct } from 'src/common/enums/product-status.enum';

export class FilterProductDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  code?: string;

  @ApiPropertyOptional()
  priceMin?: number;

  @ApiPropertyOptional()
  priceMax?: number;

  @ApiPropertyOptional({ enum: StatusProduct })
  status?: StatusProduct;

  @ApiPropertyOptional({ type: Boolean })
  isDiscount?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  display?: boolean;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  pageSize?: number;
}
