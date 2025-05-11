import { Controller, Get, Query, Param, HttpStatus } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ResponseData } from 'src/common/global/globalClass';
import { HttpMessage } from 'src/common/global/globalEnum';

@ApiTags('Reports')
@Controller('api/admin/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Get sales report' })
  @ApiQuery({ name: 'startDate', required: true, type: Date })
  @ApiQuery({ name: 'endDate', required: true, type: Date })
  async getSalesReport(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    const data = await this.reportsService.getSalesReport(startDate, endDate);
    return new ResponseData(data, HttpStatus.OK, HttpMessage.SUCCESS);
  }

  @Get('top-selling')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['week', 'month', 'quarter', 'year'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getTopSellingProducts(
    @Query('limit') limit?: number,
    @Query('period') period?: 'week' | 'month' | 'quarter' | 'year',
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const data = await this.reportsService.getTopSellingProducts(
      limit,
      period,
      page,
      pageSize,
    );
    return new ResponseData(data, HttpStatus.OK, HttpMessage.SUCCESS);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock products' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getLowStockProducts(
    @Query('threshold') threshold?: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const data = await this.reportsService.getLowStockProducts(
      threshold,
      page,
      pageSize,
    );
    return new ResponseData(data, HttpStatus.OK, HttpMessage.SUCCESS);
  }

  @Get('inventory/status')
  @ApiOperation({ summary: 'Get detailed inventory status' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['OUT_OF_STOCK', 'LOW_STOCK', 'MEDIUM_STOCK', 'HIGH_STOCK'],
  })
  async getInventoryStatus(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status')
    status?: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'MEDIUM_STOCK' | 'HIGH_STOCK',
  ) {
    const data = await this.reportsService.getInventoryStatus(
      page,
      pageSize,
      status,
    );
    return new ResponseData(data, HttpStatus.OK, HttpMessage.SUCCESS);
  }

  @Get('inventory/alerts')
  @ApiOperation({ summary: 'Get inventory alerts' })
  async getInventoryAlerts() {
    const data = await this.reportsService.getInventoryAlerts();
    return new ResponseData(data, HttpStatus.OK, HttpMessage.SUCCESS);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory report' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getInventoryReport(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const data = await this.reportsService.getInventoryReport(page, pageSize);
    return new ResponseData(data, HttpStatus.OK, HttpMessage.SUCCESS);
  }

  @Get('daily-sales')
  @ApiOperation({ summary: 'Get daily sales report' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['week', 'month', 'quarter', 'year'],
    description: 'Time period for the report',
  })
  async getDailySalesReport(
    @Query('period') period?: 'week' | 'month' | 'quarter' | 'year',
  ) {
    const data = await this.reportsService.getDailySalesReport(period);
    return new ResponseData(data, HttpStatus.OK, HttpMessage.SUCCESS);
  }

  @Get('product/:id/performance')
  @ApiOperation({ summary: 'Get product performance report' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['week', 'month', 'quarter', 'year'],
  })
  async getProductPerformanceReport(
    @Param('id') id: number,
    @Query('period') period?: 'week' | 'month' | 'quarter' | 'year',
  ) {
    const data = await this.reportsService.getProductPerformanceReport(
      id,
      period,
    );
    return new ResponseData(data, HttpStatus.OK, HttpMessage.SUCCESS);
  }

  @Get('dashboard-metrics')
  @ApiOperation({ summary: 'Get dashboard overview metrics' })
  async getDashboardMetrics() {
    const data = await this.reportsService.getDashboardMetrics();
    return new ResponseData(data, HttpStatus.OK, HttpMessage.SUCCESS);
  }

  @Get('profit-metrics')
  @ApiOperation({ summary: 'Get profit and related metrics' })
  async getProfitMetrics() {
    const data = await this.reportsService.getProfitMetrics();
    return new ResponseData(data, HttpStatus.OK, HttpMessage.SUCCESS);
  }
}
