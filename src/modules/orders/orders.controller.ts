import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  HttpStatus,
  Put,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthAdmin, AuthUser } from 'src/common/decorators/http.decorators';
import { ResponseData } from 'src/common/global/globalClass';
import { Order } from './entities/order.entity';
import { HttpMessage } from 'src/common/global/globalEnum';
import { ApiTags } from '@nestjs/swagger';
import { FilterOrderByUserDto, FilterOrderDto } from './dto/filter-order.dto';
import {
  ChangePayStatusOrderDto,
  ChangeStatusOrderDto,
} from './dto/status-order.dto';

@ApiTags('Admin - Orders')
@Controller('api/admin/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @AuthAdmin()
  @Get()
  async findAll(
    @Query() filter: FilterOrderDto,
  ): Promise<ResponseData<Order[]>> {
    try {
      const [orders, totalElements] = await this.ordersService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = orders.length;

      return new ResponseData<Order[]>(
        orders,
        HttpStatus.OK,
        'Successfully retrieved orders.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<Order[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve orders.',
      );
    }
  }

  @AuthAdmin()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<Order>> {
    try {
      const order = await this.ordersService.findOne(+id);
      if (!order) {
        return new ResponseData<Order>(
          null,
          HttpStatus.NOT_FOUND,
          'Order not found.',
        );
      }
      return new ResponseData<Order>(
        order,
        HttpStatus.OK,
        'Order retrieved successfully.',
      );
    } catch (error) {
      return new ResponseData<Order>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve order.',
      );
    }
  }

  @AuthAdmin()
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<ResponseData<Order>> {
    try {
      const updatedOrder = await this.ordersService.update(+id, updateOrderDto);
      if (!updatedOrder) {
        return new ResponseData<Order>(
          null,
          HttpStatus.NOT_FOUND,
          'Order not found for update.',
        );
      }
      return new ResponseData<Order>(
        updatedOrder,
        HttpStatus.OK,
        'Order updated successfully.',
      );
    } catch (error) {
      return new ResponseData<Order>(
        null,
        HttpStatus.BAD_REQUEST,
        'Failed to update order.',
      );
    }
  }

  @AuthAdmin()
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseData<void>> {
    try {
      await this.ordersService.remove(+id);
      return new ResponseData<void>(
        null,
        HttpStatus.NO_CONTENT,
        'Order deleted successfully.',
      );
    } catch (error) {
      return new ResponseData<void>(
        null,
        HttpStatus.BAD_REQUEST,
        'Failed to delete order.',
      );
    }
  }

  @AuthAdmin()
  @Put(':id/status')
  async changeStatusOrder(
    @Param('id') id: string,
    @Body() changeStatusOrderDto: ChangeStatusOrderDto,
  ): Promise<ResponseData<void>> {
    try {
      await this.ordersService.changeStatusOrder(+id, changeStatusOrderDto);
      return new ResponseData<void>(
        null,
        HttpStatus.OK,
        'Order status updated successfully.',
      );
    } catch (error) {
      return new ResponseData<void>(
        null,
        HttpStatus.BAD_REQUEST,
        'Failed to update order status.',
      );
    }
  }

  @AuthAdmin()
  @Put(':id/payment-status')
  async changePayStatusOrder(
    @Param('id') id: string,
    @Body() changePayStatusOrderDto: ChangePayStatusOrderDto,
  ): Promise<ResponseData<void>> {
    try {
      await this.ordersService.changePayStatusOrder(
        +id,
        changePayStatusOrderDto,
      );
      return new ResponseData<void>(
        null,
        HttpStatus.OK,
        'Order pay status updated successfully.',
      );
    } catch (error) {
      return new ResponseData<void>(
        null,
        HttpStatus.BAD_REQUEST,
        'Failed to update order status.',
      );
    }
  }
}

@ApiTags('Public - Orders')
@Controller('api/public/orders')
export class OrdersPublicController {
  constructor(private readonly ordersService: OrdersService) {}

  @AuthUser()
  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: any,
  ): Promise<ResponseData<Order>> {
    try {
      const user = req.user;
      const newOrder: Order = await this.ordersService.create(
        createOrderDto,
        user,
      );
      return new ResponseData<Order>(
        newOrder,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<Order>(
        null,
        HttpStatus.BAD_REQUEST,
        error.message,
      );
    }
  }

  @AuthUser()
  @Get('byUser')
  async findOne(
    @Query() filter: FilterOrderByUserDto,
    @Req() req: any,
  ): Promise<ResponseData<Order[]>> {
    try {
      const user = req.user;

      const [orders, totalElements] = await await this.ordersService.findByUser(
        user,
        filter,
      );
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = orders.length;

      return new ResponseData<Order[]>(
        orders,
        HttpStatus.OK,
        'Successfully retrieved orders.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<Order[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve orders.',
      );
    }
  }
}
