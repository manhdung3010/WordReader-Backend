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
  NotFoundException,
  Query,
  Patch,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthAdmin } from 'src/common/decorators/http.decorators';
import { ResponseData } from 'src/common/global/globalClass';
import { HttpMessage } from 'src/common/global/globalEnum';
import { Product } from './entities/product.entity';
import { FilterProductDto } from './dto/filter-product.dto';
import { CreateProductFlashSaleDto } from './dto/create-product-flash-sale.dto';
import { UpdateProductWarehouse } from './dto/update-product-warehouse.dto';
import { FilterPaginationDto } from './dto/filter-pagination';

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
      if (error instanceof ConflictException) {
        return new ResponseData(null, HttpStatus.CONFLICT, error.message);
      }
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
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
        'Successfully retrieved users.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<Product[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve categories.',
      );
    }
  }

  @AuthAdmin()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<Product>> {
    try {
      const product = await this.productsService.findOne(+id);
      return new ResponseData(product, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return new ResponseData(
          null,
          HttpStatus.NOT_FOUND,
          'Product not found.',
        );
      }
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
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
      if (error instanceof ConflictException) {
        return new ResponseData(null, HttpStatus.CONFLICT, error.message);
      }
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
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
      if (error instanceof ConflictException) {
        return new ResponseData(null, HttpStatus.CONFLICT, error.message);
      }
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
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
      if (error instanceof ConflictException) {
        return new ResponseData(null, HttpStatus.CONFLICT, error.message);
      }
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
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
      if (error instanceof ConflictException) {
        return new ResponseData(null, HttpStatus.CONFLICT, error.message);
      }
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
    }
  }

  @AuthAdmin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}

@ApiTags('Public - Product')
@Controller('api/public/products')
export class ProductsPublicController {
  constructor(private readonly productsService: ProductsService) {}

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
      return new ResponseData<Product[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve products.',
      );
    }
  }

  @Get('/findByKeyword/:keywordCode')
  async findByKeyword(
    @Param('keywordCode') keywordCode: string,
    @Query() filter: FilterPaginationDto,
  ): Promise<ResponseData<Product[]>> {
    try {
      const [products, totalElements] = await this.productsService.findByKeyword(
        keywordCode,
        filter,
      );
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
      if (error instanceof NotFoundException) {
        return new ResponseData(null, HttpStatus.NOT_FOUND, 'Products not found.');
      }
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
    }
  }
  
  @Get('/findByCategory/:urlCategory')
  async findByCategory(
    @Param('urlCategory') urlCategory: string,
    @Query() filter: FilterPaginationDto,
  ): Promise<ResponseData<Product[]>> {
    try {
      const [products, totalElements] = await this.productsService.findByCategory(
        urlCategory,
        filter,
      );
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
      if (error instanceof NotFoundException) {
        return new ResponseData(null, HttpStatus.NOT_FOUND, 'Products not found.');
      }
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
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
      console.error('Failed to retrieve products:', error);
      return new ResponseData<Product[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve products.',
      );
    }
  }

  @Get(':id')
  async findOnePublic(@Param('id') id: string): Promise<ResponseData<Product>> {
    try {
      const product = await this.productsService.findOne(+id);
      return new ResponseData(product, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return new ResponseData(
          null,
          HttpStatus.NOT_FOUND,
          'Product not found.',
        );
      }
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
    }
  }
}
