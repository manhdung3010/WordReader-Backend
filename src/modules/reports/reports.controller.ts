import { Controller, Get, Query, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
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
    return this.reportsService.getSalesReport(startDate, endDate);
  }

  @Get('top-selling')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['week', 'month', 'quarter', 'year'],
  })
  async getTopSellingProducts(
    @Query('limit') limit?: number,
    @Query('period') period?: 'week' | 'month' | 'quarter' | 'year',
  ) {
    return this.reportsService.getTopSellingProducts(limit, period);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock products' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  async getLowStockProducts(@Query('threshold') threshold?: number) {
    return this.reportsService.getLowStockProducts(threshold);
  }

  @Get('inventory/status')
  @ApiOperation({ summary: 'Get detailed inventory status' })
  async getInventoryStatus() {
    return this.reportsService.getInventoryStatus();
  }

  @Get('inventory/alerts')
  @ApiOperation({ summary: 'Get inventory alerts' })
  async getInventoryAlerts() {
    return this.reportsService.getInventoryAlerts();
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory report' })
  async getInventoryReport() {
    return this.reportsService.getInventoryReport();
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
    return this.reportsService.getProductPerformanceReport(id, period);
  }
}
