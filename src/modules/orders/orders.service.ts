import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { Users } from '../users/entities/users.entity';
import { FilterOrderByUserDto, FilterOrderDto } from './dto/filter-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: any): Promise<Order> {
    const userOrder = await this.usersRepository.findOneBy({ id: user.userId });
    if (!userOrder) {
      throw new NotFoundException(`User with ID ${user.userId} not found`);
    }
    const newOrder = this.orderRepository.create({
      ...createOrderDto,
      user: userOrder,
    });
    return this.orderRepository.save(newOrder);
  }

  async findAll(filter: FilterOrderDto): Promise<[Order[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const options: FindManyOptions<Order> = {
      relations: ['orderItems', 'user'],
      skip: skip,
      take: pageSize,
      where: this.buildWhereClause(filter),
    };

    try {
      const [orders, totalElements] =
        await this.orderRepository.findAndCount(options);
      return [orders, totalElements];
    } catch (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }
  }

  private buildWhereClause(filter: Partial<FilterOrderDto>): any {
    const where: any = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.payStatus) {
      where.payStatus = filter.payStatus;
    }

    if (filter.priceFrom || filter.priceTo) {
      where.totalPrice = Between(
        filter.priceFrom || 0,
        filter.priceTo || Number.MAX_SAFE_INTEGER,
      );
    }

    if (filter.createAtFrom || filter.createAtTo) {
      where.createdAt = Between(
        filter.createAtFrom || new Date(0),
        filter.createAtTo || new Date(),
      );
    }

    if (filter.userId) {
      where.user = { id: filter.userId };
    }

    return where;
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'user'],
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  async findByUser(
    user: any,
    filter: FilterOrderByUserDto,
  ): Promise<[Order[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;
  
    const whereClause: any = {
      user: { id: user.userId },
    };
  
    if (filter.status) {
      whereClause.status = filter.status;
    }
  
    if (filter.payStatus) {
      whereClause.payStatus = filter.payStatus;
    }
  
    const options: FindManyOptions<Order> = {
      relations: ['orderItems', 'user'],
      skip: skip,
      take: pageSize,
      where: whereClause,
    };
  
    try {
      const [orders, totalElements] =
        await this.orderRepository.findAndCount(options);
      return [orders, totalElements];
    } catch (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const result = await this.orderRepository.preload({
      id,
      ...updateOrderDto,
    });
    if (!result) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return this.orderRepository.save(result);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    console.log(order);

    if (order) {
      const result = await this.orderRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Order #${id} not found`);
      }
    } else {
      throw new NotFoundException(`Order #${id} not found`);
    }
  }
}
