/* eslint-disable @typescript-eslint/no-unused-vars */
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
        status: OrderStatus.DONE,
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
        startDate: startDate,
        endDate: endDate,
      },
    };
  }

  async getTopSellingProducts(
    limit: number = 10,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month',
    page: number = 1,
    pageSize: number = 10,
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
        status: OrderStatus.DONE,
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

    const allResults = Array.from(productSales.values()).sort(
      (a, b) => b.quantity - a.quantity,
    );

    const totalItems = allResults.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    return {
      data: allResults.slice(startIndex, endIndex).map((item) => ({
        product: {
          id: item.product.id,
          name: item.product.name,
        },
        quantity: item.quantity,
        revenue: item.revenue,
      })),
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };
  }

  async getLowStockProducts(
    threshold: number = 10,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const [lowStockItems, totalItems] =
      await this.productWarehouseRepository.findAndCount({
        where: {
          displayQuantity: LessThanOrEqual(threshold),
        },
        relations: ['product'],
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: lowStockItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        currentQuantity: item.displayQuantity,
        quantityInStock: item.quantityInStock,
        quantityInUse: item.quantityInUse,
        status: item.displayQuantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
      })),
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      threshold,
    };
  }

  async getInventoryStatus(
    page: number = 1,
    pageSize: number = 10,
    status?: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'MEDIUM_STOCK' | 'HIGH_STOCK',
  ) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    const recentOrders = await this.orderRepository.find({
      where: {
        createdAt: Between(thirtyDaysAgo, new Date()),
        status: OrderStatus.DONE,
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
    const allWarehouses = await this.productWarehouseRepository.find({
      relations: ['product'],
    });

    const inventoryItems = allWarehouses.map((item) => {
      const avgDailySales =
        (productSales.get(item.product.id) || 0) / daysInPeriod;
      const daysUntilStockout =
        avgDailySales > 0
          ? Math.floor(item.displayQuantity / avgDailySales)
          : Infinity;

      return {
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
    });

    // Sort inventory items by currentQuantity in descending order
    inventoryItems.sort((a, b) => b.currentQuantity - a.currentQuantity);

    // Filter by status if provided
    const filteredItems = status
      ? inventoryItems.filter((item) => item.status === status)
      : inventoryItems;

    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    // Calculate summary
    const summary = {
      totalProducts: allWarehouses.length,
      outOfStock: inventoryItems.filter(
        (item) => item.status === 'OUT_OF_STOCK',
      ).length,
      lowStock: inventoryItems.filter((item) => item.status === 'LOW_STOCK')
        .length,
      mediumStock: inventoryItems.filter(
        (item) => item.status === 'MEDIUM_STOCK',
      ).length,
      highStock: inventoryItems.filter((item) => item.status === 'HIGH_STOCK')
        .length,
    };

    return {
      data: paginatedItems,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      summary,
    };
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
        status: OrderStatus.DONE,
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

  async getInventoryReport(page: number = 1, pageSize: number = 10) {
    const [warehouses, totalItems] =
      await this.productWarehouseRepository.findAndCount({
        relations: ['product'],
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

    const totalPages = Math.ceil(totalItems / pageSize);

    const lowStockCount = await this.productWarehouseRepository.count({
      where: {
        displayQuantity: LessThanOrEqual(10),
      },
    });

    const outOfStockCount = await this.productWarehouseRepository.count({
      where: {
        displayQuantity: 0,
      },
    });

    const totalInventoryValue = await this.productWarehouseRepository
      .createQueryBuilder('warehouse')
      .leftJoin('warehouse.product', 'product')
      .select('SUM(warehouse.displayQuantity * product.price)', 'total')
      .getRawOne()
      .then((result) => parseFloat(result.total) || 0);

    return {
      data: warehouses.map((item) => ({
        product: item.product,
        displayQuantity: item.displayQuantity,
        quantityInStock: item.quantityInStock,
        quantityInUse: item.quantityInUse,
        value: item.displayQuantity * item.product.price,
      })),
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      summary: {
        totalProducts: totalItems,
        lowStockProducts: lowStockCount,
        outOfStockProducts: outOfStockCount,
        inventoryValue: totalInventoryValue,
      },
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
        status: OrderStatus.DONE,
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

  async getDailySalesReport(
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
        status: OrderStatus.DONE,
      },
    });

    // Group orders by date
    const dailySales = new Map<
      string,
      { date: string; sales: number; orderCount: number }
    >();

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      const orderTotal = order.orderItems.reduce(
        (sum, item) => sum + (item.itemTotal || 0),
        0,
      );

      if (!dailySales.has(date)) {
        dailySales.set(date, {
          date,
          sales: 0,
          orderCount: 0,
        });
      }

      const current = dailySales.get(date);
      current.sales += orderTotal;
      current.orderCount += 1;
    });

    // Convert to array and sort by date
    const result = Array.from(dailySales.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      dailyData: result,
    };
  }

  async getDashboardMetrics() {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfPreviousMonth = startOfMonth(
      new Date(now.getFullYear(), now.getMonth() - 1, 1),
    );
    const endOfPreviousMonth = new Date(startOfCurrentMonth.getTime() - 1);

    // Get current month orders
    const currentMonthOrders = await this.orderRepository.find({
      where: {
        createdAt: Between(startOfCurrentMonth, now),
        status: OrderStatus.DONE,
      },
    });

    // Get previous month orders
    const previousMonthOrders = await this.orderRepository.find({
      where: {
        createdAt: Between(startOfPreviousMonth, endOfPreviousMonth),
        status: OrderStatus.DONE,
      },
    });

    // Calculate current month metrics
    const currentMonthSales = currentMonthOrders.reduce((sum, order) => {
      return (
        sum +
        order.orderItems.reduce(
          (orderSum, item) => orderSum + (item.itemTotal || 0),
          0,
        )
      );
    }, 0);

    // Calculate previous month metrics
    const previousMonthSales = previousMonthOrders.reduce((sum, order) => {
      return (
        sum +
        order.orderItems.reduce(
          (orderSum, item) => orderSum + (item.itemTotal || 0),
          0,
        )
      );
    }, 0);

    // Calculate growth percentage
    const growthPercentage =
      previousMonthSales === 0
        ? 100
        : ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100;

    // Get total products count
    const totalProducts = await this.productRepository.count();

    // Get total users (assuming you have a users table)
    const totalUsers = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(DISTINCT order.userId)', 'count')
      .getRawOne()
      .then((result) => parseInt(result.count) || 0);

    // Get total transactions
    const totalTransactions = await this.orderRepository.count({
      where: {
        status: OrderStatus.DONE,
      },
    });

    return {
      metrics: {
        transactions: {
          total: totalTransactions,
          growth: growthPercentage.toFixed(1),
          growthType: growthPercentage >= 0 ? 'positive' : 'negative',
        },
        sales: {
          total: currentMonthSales,
          formatted: this.formatCurrency(currentMonthSales),
        },
        users: {
          total: totalUsers,
          formatted: this.formatNumber(totalUsers),
        },
        products: {
          total: totalProducts,
          formatted: this.formatNumber(totalProducts),
        },
      },
      period: {
        currentMonth: startOfCurrentMonth.toISOString(),
        previousMonth: startOfPreviousMonth.toISOString(),
      },
    };
  }

  async getProfitMetrics() {
    const now = new Date();
    const startOfCurrentWeek = startOfWeek(now);
    const startOfPreviousWeek = startOfWeek(
      new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    );
    const startOfCurrentYear = startOfYear(now);
    const startOfPreviousYear = startOfYear(
      new Date(now.getFullYear() - 1, 0, 1),
    );

    // Get current week orders
    const currentWeekOrders = await this.orderRepository.find({
      where: {
        createdAt: Between(startOfCurrentWeek, now),
        status: OrderStatus.DONE,
      },
    });

    // Get previous week orders
    const previousWeekOrders = await this.orderRepository.find({
      where: {
        createdAt: Between(startOfPreviousWeek, startOfCurrentWeek),
        status: OrderStatus.DONE,
      },
    });

    // Get current year orders
    const currentYearOrders = await this.orderRepository.find({
      where: {
        createdAt: Between(startOfCurrentYear, now),
        status: OrderStatus.DONE,
      },
    });

    // Get previous year orders
    const previousYearOrders = await this.orderRepository.find({
      where: {
        createdAt: Between(startOfPreviousYear, startOfCurrentYear),
        status: OrderStatus.DONE,
      },
    });

    // Calculate profits
    const calculateProfit = (orders: Order[]) => {
      return orders.reduce((total, order) => {
        const orderProfit = order.orderItems.reduce((sum, item) => {
          const cost = item.product.price * 0.7 * item.quantity; // Assuming 30% profit margin
          const revenue = item.itemTotal || 0;
          return sum + (revenue - cost);
        }, 0);
        return total + orderProfit;
      }, 0);
    };

    const currentWeekProfit = calculateProfit(currentWeekOrders);
    const previousWeekProfit = calculateProfit(previousWeekOrders);
    const currentYearProfit = calculateProfit(currentYearOrders);
    const previousYearProfit = calculateProfit(previousYearOrders);

    // Calculate growth percentages
    const weeklyGrowth =
      previousWeekProfit === 0
        ? 100
        : ((currentWeekProfit - previousWeekProfit) / previousWeekProfit) * 100;

    const yearlyGrowth =
      previousYearProfit === 0
        ? 100
        : ((currentYearProfit - previousYearProfit) / previousYearProfit) * 100;

    // Get total sessions (unique orders)
    const totalSessions = await this.orderRepository.count({
      where: {
        status: OrderStatus.DONE,
      },
    });

    // Get new projects (orders in current year)
    const newProjects = currentYearOrders.length;

    // Calculate new projects growth
    const previousYearProjects = previousYearOrders.length;
    const newProjectsGrowth =
      previousYearProjects === 0
        ? 100
        : ((newProjects - previousYearProjects) / previousYearProjects) * 100;

    return {
      metrics: {
        totalProfit: {
          amount: currentYearProfit,
          formatted: this.formatCurrency(currentYearProfit),
          growth: yearlyGrowth.toFixed(1),
          growthType: yearlyGrowth >= 0 ? 'positive' : 'negative',
        },
        weeklyProfit: {
          amount: currentWeekProfit,
          formatted: this.formatCurrency(currentWeekProfit),
          growth: weeklyGrowth.toFixed(1),
          growthType: weeklyGrowth >= 0 ? 'positive' : 'negative',
        },
        newProjects: {
          count: newProjects,
          formatted: this.formatNumber(newProjects),
          growth: newProjectsGrowth.toFixed(1),
          growthType: newProjectsGrowth >= 0 ? 'positive' : 'negative',
        },
        yearlyProjects: {
          count: totalSessions,
          formatted: this.formatNumber(totalSessions),
        },
      },
      period: {
        currentWeek: startOfCurrentWeek.toISOString(),
        previousWeek: startOfPreviousWeek.toISOString(),
        currentYear: startOfCurrentYear.toISOString(),
        previousYear: startOfPreviousYear.toISOString(),
      },
    };
  }

  private formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toFixed(2)}`;
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  }
}
