import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { productWarehouse } from '../products/entities/product-warehouse.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Product, Order, productWarehouse])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
