import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ProductsController,
  ProductsPublicController,
} from './products.controller';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categories } from '../categories/entities/category.entity';
import { InfoProduct } from './entities/info-product.entity';
import { Keyword } from '../keywords/entities/keyword.entity';
import { productWarehouse } from './entities/product-warehouse.entity';
import { ReviewsProduct } from '../reviews-product/entities/reviews-product.entity';
import { UsersModule } from '../users/users.module'; // Import UsersModule
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Categories,
      InfoProduct,
      Keyword,
      productWarehouse,
      ReviewsProduct,
    ]),
    UsersModule, 
    AiModule,
  ],
  controllers: [ProductsController, ProductsPublicController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
