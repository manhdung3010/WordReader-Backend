import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController, OrdersPublicController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../users/entities/users.entity';
import { Order } from './entities/order.entity';
import { DiscountsModule } from '../discounts/discounts.module';
import { Product } from '../products/entities/product.entity';
import { productWarehouse } from '../products/entities/product-warehouse.entity';
import { Discount } from '../discounts/entities/discount.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Users, Product, productWarehouse, Discount]),
    DiscountsModule,
  ],
  controllers: [OrdersController, OrdersPublicController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
