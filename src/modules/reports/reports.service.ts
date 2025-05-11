import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, In } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { productWarehouse } from '../products/entities/product-warehouse.entity';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { OrderStatus } from 'src/common/enums/order-status.enum';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(productWarehouse)
    private productWarehouseRepository: Repository<productWarehouse>,
  ) {}

  async getSalesReport(startDate: Date, endDate: Date) {
    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: In([OrderStatus.DONE, OrderStatus.PENDING]),
      },
    });

    const salesData = orders.reduce((acc, order) => {
      const orderTotal = order.orderItems.reduce((sum, item) => {
        return sum + (item.itemTotal || 0);
      }, 0);
      return acc + orderTotal;
    }, 0);

    return {
      totalSales: salesData,
      orderCount: orders.length,
      period: {
        startDate,
        endDate,
      },
    };
  }

  async getTopSellingProducts(
    limit: number = 10,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month',
  ) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'quarter':
        startDate = startOfQuarter(now);
        endDate = endOfQuarter(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
    }

    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: In([OrderStatus.DONE, OrderStatus.PENDING]),
      },
    });

    const productSales = new Map<
      number,
      { product: Product; quantity: number; revenue: number }
    >();

    orders.forEach((order) => {
      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach((item) => {
          if (item.product && item.product.id) {
            const productId = item.product.id;
            if (!productSales.has(productId)) {
              productSales.set(productId, {
                product: item.product,
                quantity: 0,
                revenue: 0,
              });
            }
            const current = productSales.get(productId);
            current.quantity += item.quantity || 0;
            current.revenue += item.itemTotal || 0;
          }
        });
      }
    });

    const result = Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);

    return result;
  }

  async getLowStockProducts(threshold: number = 10) {
    const lowStockItems = await this.productWarehouseRepository.find({
      where: {
        displayQuantity: LessThanOrEqual(threshold),
      },
      relations: ['product'],
    });

    return {
      threshold,
      totalLowStockItems: lowStockItems.length,
      items: lowStockItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        currentQuantity: item.displayQuantity,
        quantityInStock: item.quantityInStock,
        quantityInUse: item.quantityInUse,
        status: item.displayQuantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
      })),
    };
  }

  async getInventoryStatus() {
    const allWarehouses = await this.productWarehouseRepository.find({
      relations: ['product'],
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    const recentOrders = await this.orderRepository.find({
      where: {
        createdAt: Between(thirtyDaysAgo, new Date()),
        status: In([OrderStatus.DONE, OrderStatus.PENDING]),
      },
    });

    const productSales = new Map<number, number>();
    recentOrders.forEach((order) => {
      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach((item) => {
          if (item.product && item.product.id) {
            const currentSales = productSales.get(item.product.id) || 0;
            productSales.set(item.product.id, currentSales + item.quantity);
          }
        });
      }
    });

    const daysInPeriod = 30;
    const result = {
      outOfStock: [],
      lowStock: [],
      mediumStock: [],
      highStock: [],
      summary: {
        totalProducts: allWarehouses.length,
        outOfStock: 0,
        lowStock: 0,
        mediumStock: 0,
        highStock: 0,
      },
    };

    allWarehouses.forEach((item) => {
      const avgDailySales =
        (productSales.get(item.product.id) || 0) / daysInPeriod;
      const daysUntilStockout =
        avgDailySales > 0
          ? Math.floor(item.displayQuantity / avgDailySales)
          : Infinity;

      const productInfo = {
        productId: item.product.id,
        productName: item.product.name,
        currentQuantity: item.displayQuantity,
        quantityInStock: item.quantityInStock,
        quantityInUse: item.quantityInUse,
        averageDailySales: avgDailySales,
        daysUntilStockout: daysUntilStockout,
        status: this.getStockStatus(item.displayQuantity, daysUntilStockout),
        value: item.displayQuantity * item.product.price,
      };

      switch (productInfo.status) {
        case 'OUT_OF_STOCK':
          result.outOfStock.push(productInfo);
          result.summary.outOfStock++;
          break;
        case 'LOW_STOCK':
          result.lowStock.push(productInfo);
          result.summary.lowStock++;
          break;
        case 'MEDIUM_STOCK':
          result.mediumStock.push(productInfo);
          result.summary.mediumStock++;
          break;
        case 'HIGH_STOCK':
          result.highStock.push(productInfo);
          result.summary.highStock++;
          break;
      }
    });

    result.outOfStock.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
    result.lowStock.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
    result.mediumStock.sort(
      (a, b) => a.daysUntilStockout - b.daysUntilStockout,
    );
    result.highStock.sort((a, b) => b.currentQuantity - a.currentQuantity);

    return result;
  }

  private getStockStatus(quantity: number, daysUntilStockout: number): string {
    if (quantity === 0) return 'OUT_OF_STOCK';
    if (daysUntilStockout <= 7) return 'LOW_STOCK';
    if (daysUntilStockout <= 30) return 'MEDIUM_STOCK';
    return 'HIGH_STOCK';
  }

  async getInventoryAlerts() {
    const warehouses = await this.productWarehouseRepository.find({
      relations: ['product'],
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));

    const recentOrders = await this.orderRepository.find({
      where: {
        createdAt: Between(sevenDaysAgo, new Date()),
        status: In([OrderStatus.DONE, OrderStatus.PENDING]),
      },
    });

    const productSales = new Map<number, number>();
    recentOrders.forEach((order) => {
      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach((item) => {
          if (item.product && item.product.id) {
            const currentSales = productSales.get(item.product.id) || 0;
            productSales.set(item.product.id, currentSales + item.quantity);
          }
        });
      }
    });

    const alerts = {
      critical: [], // Sẽ hết hàng trong 3 ngày
      warning: [], // Sẽ hết hàng trong 7 ngày
      info: [], // Cần theo dõi
    };

    warehouses.forEach((item) => {
      const avgDailySales = (productSales.get(item.product.id) || 0) / 7;
      const daysUntilStockout =
        avgDailySales > 0
          ? Math.floor(item.displayQuantity / avgDailySales)
          : Infinity;

      const alert = {
        productId: item.product.id,
        productName: item.product.name,
        currentQuantity: item.displayQuantity,
        quantityInStock: item.quantityInStock,
        quantityInUse: item.quantityInUse,
        averageDailySales: avgDailySales,
        daysUntilStockout: daysUntilStockout,
        recommendedAction: this.getRecommendedAction(daysUntilStockout),
      };

      if (daysUntilStockout <= 3) {
        alerts.critical.push(alert);
      } else if (daysUntilStockout <= 7) {
        alerts.warning.push(alert);
      } else if (daysUntilStockout <= 14) {
        alerts.info.push(alert);
      }
    });

    return alerts;
  }

  private getRecommendedAction(daysUntilStockout: number): string {
    if (daysUntilStockout <= 3) {
      return 'Cần nhập hàng ngay lập tức';
    } else if (daysUntilStockout <= 7) {
      return 'Cần lên kế hoạch nhập hàng trong tuần này';
    } else if (daysUntilStockout <= 14) {
      return 'Theo dõi và chuẩn bị kế hoạch nhập hàng';
    }
    return 'Tình trạng ổn định';
  }

  async getInventoryReport() {
    const warehouses = await this.productWarehouseRepository.find({
      relations: ['product'],
    });

    return {
      totalProducts: warehouses.length,
      lowStockProducts: warehouses.filter((item) => item.displayQuantity <= 10)
        .length,
      outOfStockProducts: warehouses.filter(
        (item) => item.displayQuantity === 0,
      ).length,
      inventoryValue: warehouses.reduce((sum, item) => {
        return sum + item.displayQuantity * item.product.price;
      }, 0),
      details: warehouses.map((item) => ({
        product: item.product,
        displayQuantity: item.displayQuantity,
        quantityInStock: item.quantityInStock,
        quantityInUse: item.quantityInUse,
        value: item.displayQuantity * item.product.price,
      })),
    };
  }

  async getProductPerformanceReport(
    productId: number,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month',
  ) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'quarter':
        startDate = startOfQuarter(now);
        endDate = endOfQuarter(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
    }

    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: In([OrderStatus.DONE, OrderStatus.PENDING]),
      },
    });

    const productOrders = orders.filter(
      (order) =>
        order.orderItems &&
        Array.isArray(order.orderItems) &&
        order.orderItems.some(
          (item) => item.product && item.product.id === productId,
        ),
    );

    const totalQuantity = productOrders.reduce((sum, order) => {
      const orderItem = order.orderItems.find(
        (item) => item.product && item.product.id === productId,
      );
      return sum + (orderItem ? orderItem.quantity : 0);
    }, 0);

    const totalRevenue = productOrders.reduce((sum, order) => {
      const orderItem = order.orderItems.find(
        (item) => item.product && item.product.id === productId,
      );
      return sum + (orderItem ? orderItem.itemTotal || 0 : 0);
    }, 0);

    return {
      productId,
      period: {
        startDate,
        endDate,
      },
      totalOrders: productOrders.length,
      totalQuantity,
      totalRevenue,
      averageOrderValue: totalRevenue / (productOrders.length || 1),
    };
  }
}
