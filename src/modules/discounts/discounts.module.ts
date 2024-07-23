import { Module } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import {
  DiscountsController,
  DiscountsPublicController,
} from './discounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discount } from './entities/discount.entity';
import { Categories } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Discount, Categories, Product])],
  controllers: [DiscountsController, DiscountsPublicController],
  providers: [DiscountsService],
  exports: [DiscountsService],
})
export class DiscountsModule {}
