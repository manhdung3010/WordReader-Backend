import { Module } from '@nestjs/common';
import { ReviewsProductService } from './reviews-product.service';
import { PublicReviewsProductController, ReviewsProductController } from './reviews-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsProduct } from './entities/reviews-product.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewsProduct, Product])],
  controllers: [ReviewsProductController, PublicReviewsProductController],
  providers: [ReviewsProductService],
  exports: [ReviewsProductService],
})
export class ReviewsProductModule {}
