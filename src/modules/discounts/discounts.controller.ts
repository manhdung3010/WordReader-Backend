import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  ConflictException,
  Query,
} from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ResponseData } from 'src/common/global/globalClass';
import { Discount } from './entities/discount.entity';
import { HttpMessage } from 'src/common/global/globalEnum';
import { ApiTags } from '@nestjs/swagger';
import { AuthAdmin } from 'src/common/decorators/http.decorators';
import { FilterDiscountDto } from './dto/filter-discount.dto';

@ApiTags('Admin - Discount Product')
@Controller('api/admin/discount-product')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @AuthAdmin()
  @Post()
  async create(
    @Body() createDiscountDto: CreateDiscountDto,
  ): Promise<ResponseData<Discount>> {
    try {
      const newDiscount = await this.discountsService.create(createDiscountDto);
      return new ResponseData<Discount>(
        newDiscount,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseData<Discount>(
          null,
          HttpStatus.CONFLICT,
          error.message,
        );
      }
      return new ResponseData<Discount>(
        null,
        HttpStatus.BAD_REQUEST,
        HttpMessage.ERROR,
      );
    }
  }

  @AuthAdmin()
  @Get()
  async findAll(
    @Query() filter: FilterDiscountDto,
  ): Promise<ResponseData<Discount[]>> {
    try {
      const [discounts, totalElements] =
        await this.discountsService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = discounts.length;

      return new ResponseData<Discount[]>(
        discounts,
        HttpStatus.OK,
        'Successfully retrieved discounts.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<Discount[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve discounts.',
      );
    }
  }

  @AuthAdmin()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<Discount>> {
    try {
      const discount = await this.discountsService.findOne(+id);
      return new ResponseData<Discount>(
        discount,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<Discount>(
        null,
        HttpStatus.NOT_FOUND,
        'Discount not found.',
      );
    }
  }

  @AuthAdmin()
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ): Promise<ResponseData<Discount>> {
    try {
      const updatedDiscount = await this.discountsService.update(
        +id,
        updateDiscountDto,
      );
      return new ResponseData<Discount>(
        updatedDiscount,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<Discount>(
        null,
        HttpStatus.BAD_REQUEST,
        'Failed to update discount.',
      );
    }
  }

  @AuthAdmin()
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseData<void>> {
    try {
      await this.discountsService.remove(+id);
      return new ResponseData<void>(
        null,
        HttpStatus.OK,
        'Discount successfully deleted.',
      );
    } catch (error) {
      return new ResponseData<void>(
        null,
        HttpStatus.BAD_REQUEST,
        'Failed to delete discount.',
      );
    }
  }
}

@ApiTags('Public - Discount Product')
@Controller('api/public/discount-product')
export class DiscountsPublicController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  async findAll(
    @Query() filter: FilterDiscountDto,
  ): Promise<ResponseData<Discount[]>> {
    try {
      const [discounts, totalElements] =
        await this.discountsService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = discounts.length;

      return new ResponseData<Discount[]>(
        discounts,
        HttpStatus.OK,
        'Successfully retrieved discounts.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<Discount[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve discounts.',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<Discount>> {
    try {
      const discount = await this.discountsService.findOne(+id);
      return new ResponseData<Discount>(
        discount,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<Discount>(
        null,
        HttpStatus.NOT_FOUND,
        'Discount not found.',
      );
    }
  }
}
