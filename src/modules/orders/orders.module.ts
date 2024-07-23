import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController, OrdersPublicController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../users/entities/users.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Users, OrderItem])],
  controllers: [OrdersController, OrdersPublicController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
