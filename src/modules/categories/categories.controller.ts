import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ResponseData } from 'src/common/global/globalClass';
import { Categories } from './entities/category.entity';
import { FilterCategoryDto } from './dto/filter-category.dto';
import { HttpMessage } from 'src/common/global/globalEnum';
import { ApiTags } from '@nestjs/swagger';
import { AuthAdmin } from 'src/common/decorators/http.decorators';

@ApiTags('Admin - Category Product')
@Controller('api/admin/category-product')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @AuthAdmin()
  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ResponseData<Categories>> {
    try {
      const newCategory: Categories =
        await this.categoriesService.create(createCategoryDto);
      return new ResponseData<Categories>(
        newCategory,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseData<Categories>(
          null,
          HttpStatus.CONFLICT,
          error.message,
        );
      }
      return new ResponseData<Categories>(
        null,
        HttpStatus.BAD_REQUEST,
        HttpMessage.ERROR,
      );
    }
  }

  @AuthAdmin()
  @Get()
  async findAll(
    @Query() filter: FilterCategoryDto,
  ): Promise<ResponseData<Categories[]>> {
    try {
      const [categories, totalElements] =
        await this.categoriesService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = categories.length;

      return new ResponseData<Categories[]>(
        categories,
        HttpStatus.OK,
        'Successfully retrieved categories.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<Categories[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve categories.',
      );
    }
  }

  @AuthAdmin()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<Categories>> {
    try {
      const category: Categories = await this.categoriesService.findOne(+id);
      return new ResponseData<Categories>(
        category,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseData<Categories>(
          null,
          HttpStatus.CONFLICT,
          error.message,
        );
      }
      return new ResponseData<Categories>(
        null,
        HttpStatus.BAD_REQUEST,
        HttpMessage.ERROR,
      );
    }
  }

  @AuthAdmin()
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ResponseData<Categories>> {
    try {
      const category: Categories = await this.categoriesService.update(
        +id,
        updateCategoryDto,
      );
      return new ResponseData<Categories>(
        category,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseData<Categories>(
          null,
          HttpStatus.CONFLICT,
          error.message,
        );
      }
      return new ResponseData<Categories>(
        null,
        HttpStatus.BAD_REQUEST,
        HttpMessage.ERROR,
      );
    }
  }

  @AuthAdmin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
