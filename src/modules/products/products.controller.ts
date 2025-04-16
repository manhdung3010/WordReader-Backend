import { UsersService } from './../users/users.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  Query,
  Patch,
  Req,
  HttpException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthAdmin, AuthUser } from 'src/common/decorators/http.decorators';
import { ResponseData } from 'src/common/global/globalClass';
import { HttpMessage } from 'src/common/global/globalEnum';
import { Product } from './entities/product.entity';
import { FilterProductDto } from './dto/filter-product.dto';
import { CreateProductFlashSaleDto } from './dto/create-product-flash-sale.dto';
import { UpdateProductWarehouse } from './dto/update-product-warehouse.dto';
import { FilterPaginationDto } from './dto/filter-pagination';
import { LogViewDto } from '../users/dto/log-view.dto';

@ApiTags('Admin - Product')
@Controller('api/admin/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @AuthAdmin()
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ResponseData<Product>> {
    try {
      const newProduct = await this.productsService.create(createProductDto);
      return new ResponseData(
        newProduct,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @AuthAdmin()
  @Get()
  async findAll(
    @Query() filter: FilterProductDto,
  ): Promise<ResponseData<Product[]>> {
    try {
      const [products, totalElements] =
        await this.productsService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = products.length;

      return new ResponseData<Product[]>(
        products,
        HttpStatus.OK,
        'Successfully retrieved products.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @AuthAdmin()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<Product>> {
    try {
      const product = await this.productsService.findOne(+id);
      return new ResponseData(product, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @AuthAdmin()
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ResponseData<Product>> {
    try {
      const updatedProduct = await this.productsService.update(
        +id,
        updateProductDto,
      );
      return new ResponseData(
        updatedProduct,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @AuthAdmin()
  @Post('/create-flash-sale/:id')
  async createFlashSale(
    @Param('id') id: string,
    @Body() createProductFlashSaleDto: CreateProductFlashSaleDto,
  ): Promise<ResponseData<Product>> {
    try {
      const updatedProduct = await this.productsService.createFlashSale(
        +id,
        createProductFlashSaleDto,
      );
      return new ResponseData(
        updatedProduct,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @AuthAdmin()
  @Patch('/update-product-warehouse/:id')
  async updateProductWarehouse(
    @Param('id') id: string,
    @Body() updateProductWarehouse: UpdateProductWarehouse,
  ): Promise<ResponseData<Product>> {
    try {
      const updatedProduct = await this.productsService.updateProductWarehouse(
        +id,
        updateProductWarehouse,
      );
      return new ResponseData(
        updatedProduct,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @AuthAdmin()
  @Delete('/delete-flash-sale/:id')
  async deleteFlashSale(
    @Param('id') id: string,
  ): Promise<ResponseData<Product>> {
    try {
      const updatedProduct = await this.productsService.deleteFlashSale(+id);
      return new ResponseData(
        updatedProduct,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @AuthAdmin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    try {
      return this.productsService.remove(+id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

@ApiTags('Public - Product')
@Controller('api/public/products')
export class ProductsPublicController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async findAllPublic(
    @Query() filter: FilterProductDto,
  ): Promise<ResponseData<Product[]>> {
    try {
      const [products, totalElements] =
        await this.productsService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = products.length;

      return new ResponseData<Product[]>(
        products,
        HttpStatus.OK,
        'Successfully retrieved product.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/findByKeyword/:keywordCode')
  async findByKeyword(
    @Param('keywordCode') keywordCode: string,
    @Query() filter: FilterPaginationDto,
  ): Promise<ResponseData<Product[]>> {
    try {
      const [products, totalElements] =
        await this.productsService.findByKeyword(keywordCode, filter);
      const pageSize = filter.pageSize || 20;
      const totalPages = Math.ceil(totalElements / pageSize);
      const size = products.length;

      return new ResponseData<Product[]>(
        products,
        HttpStatus.OK,
        'Successfully retrieved products.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/findByCategory/:urlCategory')
  async findByCategory(
    @Param('urlCategory') urlCategory: string,
    @Query() filter: FilterPaginationDto,
  ): Promise<ResponseData<Product[]>> {
    try {
      const [products, totalElements] =
        await this.productsService.findByCategory(urlCategory, filter);
      const pageSize = filter.pageSize || 20;
      const totalPages = Math.ceil(totalElements / pageSize);
      const size = products.length;

      return new ResponseData<Product[]>(
        products,
        HttpStatus.OK,
        'Successfully retrieved products.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/flash-sale')
  async findAllFlashSale(): Promise<ResponseData<Product[]>> {
    try {
      const products = await this.productsService.findAllFlashSale();

      return new ResponseData<Product[]>(
        products,
        HttpStatus.OK,
        'Successfully retrieved products.',
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async findOnePublic(@Param('id') id: string): Promise<ResponseData<Product>> {
    try {
      const product = await this.productsService.findOne(+id);
      return new ResponseData(product, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('findByUrl/:url')
  async findByUrlPublic(
    @Param('url') url: string,
  ): Promise<ResponseData<Product>> {
    try {
      const product = await this.productsService.findOneByUrl(url);
      return new ResponseData(product, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @AuthUser()
  @Post('/view')
  async logProductView(
    @Body() logViewDto: LogViewDto,
    @Req() req: any,
  ): Promise<ResponseData<any>> {
    try {
      const user = req.user;

      if (!user) {
        return new ResponseData<any>(
          null,
          HttpStatus.UNAUTHORIZED,
          'User not authenticated',
        );
      }

      await this.usersService.logView(logViewDto, user);

      return new ResponseData<any>(
        null,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<any>(
        null,
        HttpStatus.BAD_REQUEST,
        error.message || 'An error occurred',
      );
    }
  }
}
