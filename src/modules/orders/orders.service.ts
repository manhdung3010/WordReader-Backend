import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, In, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { Users } from '../users/entities/users.entity';
import { FilterOrderByUserDto, FilterOrderDto } from './dto/filter-order.dto';
import { DiscountsService } from '../discounts/discounts.service';
import { Product } from '../products/entities/product.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { OrderPayStatus } from 'src/common/enums/order-pay-status.enum';
import { instanceToPlain } from 'class-transformer';
import { productWarehouse } from '../products/entities/product-warehouse.entity';
import { Discount } from '../discounts/entities/discount.entity';
import { StatusProduct } from 'src/common/enums/product-status.enum';
import {
  ChangePayStatusOrderDto,
  ChangeStatusOrderDto,
} from './dto/status-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(productWarehouse)
    private readonly productWarehouseRepository: Repository<productWarehouse>,

    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,

    private readonly discountsService: DiscountsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: any): Promise<Order> {
    const userOrder = await this.usersRepository.findOneBy({ id: user.userId });
    if (!userOrder) throw new Error(`User with ID ${user.userId} not found`);

    const productIds =
      createOrderDto.orderItems?.map((product) => product.productId) || [];

    const productData = await this.productRepository.find({
      where: { id: In(productIds) },
    });

    for (const itemDto of createOrderDto.orderItems) {
      const product = productData.find((p) => p.id === itemDto.productId);
      if (!product) {
        throw new Error(`Product with ID ${itemDto.productId} not found`);
      }
      if (product.status === StatusProduct.OUT_OF_STOCK) {
        throw new Error(`Product with ID ${itemDto.productId} is out of stock`);
      }
    }

    const nowUTC = new Date(new Date().toISOString());
    let totalPrice = 0;

    const orderItemsWithDetails = createOrderDto.orderItems.map((itemDto) => {
      const product = productData.find((p) => p.id === itemDto.productId);
      if (!product) {
        throw new Error(`Product with ID ${itemDto.productId} not found`);
      }

      const { flashSale, price, perDiscount } = product;
      let finalPrice = price;

      if (flashSale) {
        const start = new Date(flashSale.flashSaleStartTime);
        const end = new Date(flashSale.flashSaleEndTime);
        const inFlashSale = nowUTC >= start && nowUTC <= end;

        if (inFlashSale) {
          finalPrice = price * (1 - flashSale.flashSaleDiscount / 100);
        } else if (perDiscount > 0) {
          finalPrice = price * (1 - perDiscount / 100);
        }
      } else if (perDiscount > 0) {
        finalPrice = price * (1 - perDiscount / 100);
      }

      const itemTotal = finalPrice * itemDto.quantity;
      totalPrice += itemTotal;

      return {
        ...itemDto,
        product,
        unitPrice: finalPrice,
        itemTotal,
      };
    });

    let discountAmount = 0;

    if (createOrderDto.discountCode) {
      const checkDiscountDto = {
        code: createOrderDto.discountCode,
        products: createOrderDto.orderItems,
      };

      try {
        const discountResult =
          await this.discountsService.checkDiscount(checkDiscountDto);
        discountAmount = discountResult.priceReduce;

        discountResult.discount.usageLimit -= 1;
        await this.discountRepository.save(discountResult.discount);
      } catch (error) {
        throw new Error(`Invalid discount code: ${error.message}`);
      }
    }

    let newOrder = this.orderRepository.create({
      ...createOrderDto,
      user: userOrder,
      discountPrice: discountAmount,
      totalPrice,
      status: OrderStatus.PENDING,
      payStatus: OrderPayStatus.PENDING,
      orderItems: orderItemsWithDetails,
    });

    for (const item of createOrderDto.orderItems) {
      const productWarehouse = await this.productWarehouseRepository.findOne({
        where: { product: { id: item.productId } },
      });

      if (!productWarehouse) {
        throw new Error(
          `Product warehouse for product ID ${item.productId} not found`,
        );
      }

      if (productWarehouse.displayQuantity < item.quantity) {
        throw new Error(`Not enough stock for product ID ${item.productId}`);
      }

      productWarehouse.displayQuantity -= item.quantity;
      productWarehouse.quantityInUse += item.quantity;
      await this.productWarehouseRepository.save(productWarehouse);
    }

    newOrder = await this.orderRepository.save(newOrder);
    newOrder.orderCode = `ORD-${newOrder.id}`;
    return this.orderRepository.save(newOrder);
  }

  async findAll(filter: FilterOrderDto): Promise<[Order[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const options: FindManyOptions<Order> = {
      relations: ['user'],
      skip: skip,
      take: pageSize,
      where: this.buildWhereClause(filter),
    };

    try {
      const [orders, totalElements] =
        await this.orderRepository.findAndCount(options);

      const plainOrders = orders.map((order) => instanceToPlain(order));

      return [plainOrders as Order[], totalElements];
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
      relations: ['user'],
    });

    if (!order) {
      throw new Error(`Order #${id} not found`);
    }

    return instanceToPlain(order) as Order;
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
      relations: ['user'],
      skip: skip,
      take: pageSize,
      where: whereClause,
    };

    try {
      const [orders, totalElements] =
        await this.orderRepository.findAndCount(options);

      const plainOrders = orders.map((order) => instanceToPlain(order));

      return [plainOrders as Order[], totalElements];
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
      throw new Error(`Order #${id} not found`);
    }
    return this.orderRepository.save(result);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);

    if (order) {
      const result = await this.orderRepository.delete(id);
      if (result.affected === 0) {
        throw new Error(`Order #${id} not found`);
      }
    } else {
      throw new Error(`Order #${id} not found`);
    }
  }

  async changeStatusOrder(
    orderId: number,
    changeStatusOrderDto: ChangeStatusOrderDto,
  ): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    if (!Object.values(OrderStatus).includes(changeStatusOrderDto.status)) {
      throw new Error(`Invalid order status: ${changeStatusOrderDto.status}`);
    }

    // Save the order status change
    order.status = changeStatusOrderDto.status;
    await this.orderRepository.save(order);

    // Update product warehouse quantities based on order status
    for (const item of order.orderItems) {
      const productWarehouse = await this.productWarehouseRepository.findOne({
        where: { product: { id: item.product.id } },
      });

      if (!productWarehouse) {
        throw new Error(
          `Product warehouse for product ID ${item.product.id} not found`,
        );
      }

      if (changeStatusOrderDto.status === OrderStatus.DONE) {
        // Update quantities when status is DONE
        productWarehouse.quantityInStock -= item.quantity;
        productWarehouse.quantityInUse -= item.quantity;
      } else if (changeStatusOrderDto.status === OrderStatus.CANCELLED) {
        // Update quantities when status is CANCELLED
        productWarehouse.quantityInUse -= item.quantity;
        productWarehouse.displayQuantity += item.quantity;
      }

      await this.productWarehouseRepository.save(productWarehouse);
    }
  }
  async changePayStatusOrder(
    orderId: number,
    changePayStatusOrderDto: ChangePayStatusOrderDto,
  ): Promise<void> {
    // Find the order by ID
    const order = await this.orderRepository.findOneBy({ id: orderId });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    // Validate new status if needed (e.g., ensure it is a valid status)
    if (
      !Object.values(OrderPayStatus).includes(changePayStatusOrderDto.payStatus)
    ) {
      throw new Error(
        `Invalid order payStatus: ${changePayStatusOrderDto.payStatus}`,
      );
    }

    // Update the order status
    order.payStatus = changePayStatusOrderDto.payStatus;

    // Save the updated order
    await this.orderRepository.save(order);
  }
}
