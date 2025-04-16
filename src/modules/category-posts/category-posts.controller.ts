import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  Query,
  Put,
} from '@nestjs/common';
import { CategoryPostsService } from './category-posts.service';
import { CreateCategoryPostDto } from './dto/create-category-post.dto';
import { UpdateCategoryPostDto } from './dto/update-category-post.dto';
import { AuthAdmin } from 'src/common/decorators/http.decorators';
import { ResponseData } from 'src/common/global/globalClass';
import { CategoryPost } from './entities/category-post.entity';
import { HttpMessage } from 'src/common/global/globalEnum';
import { FilterCategoryPostsDto } from './dto/filter-category-posts.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin - Category Post')
@Controller('api/admin/category-posts')
export class CategoryPostsController {
  constructor(private readonly categoryPostsService: CategoryPostsService) {}

  @AuthAdmin()
  @Post()
  async create(
    @Body() createCategoryPostDto: CreateCategoryPostDto,
  ): Promise<ResponseData<CategoryPost>> {
    try {
      const newCategory: CategoryPost = await this.categoryPostsService.create(
        createCategoryPostDto,
      );
      return new ResponseData<CategoryPost>(
        newCategory,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<CategoryPost>(
        null,
        HttpStatus.BAD_REQUEST,
        error.message,
      );
    }
  }

  @AuthAdmin()
  @Get()
  async findAll(
    @Query() filter: FilterCategoryPostsDto,
  ): Promise<ResponseData<CategoryPost[]>> {
    try {
      const [categories, totalElements] =
        await this.categoryPostsService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = categories.length;

      return new ResponseData<CategoryPost[]>(
        categories,
        HttpStatus.OK,
        'Successfully retrieved categories.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<CategoryPost[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve categories.',
      );
    }
  }
  @AuthAdmin()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<CategoryPost>> {
    try {
      const category: CategoryPost =
        await this.categoryPostsService.findOne(+id);
      return new ResponseData<CategoryPost>(
        category,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<CategoryPost>(
        null,
        HttpStatus.BAD_REQUEST,
        error.message,
      );
    }
  }

  @AuthAdmin()
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategorPostDto: UpdateCategoryPostDto,
  ): Promise<ResponseData<CategoryPost>> {
    try {
      const category: CategoryPost = await this.categoryPostsService.update(
        +id,
        updateCategorPostDto,
      );
      return new ResponseData<CategoryPost>(
        category,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<CategoryPost>(
        null,
        HttpStatus.BAD_REQUEST,
        error.message,
      );
    }
  }

  @AuthAdmin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryPostsService.remove(+id);
  }
}

@ApiTags('Public - Category Post')
@Controller('api/public/category-post')
export class CategoryPostPublicController {
  constructor(private readonly categoryPostsService: CategoryPostsService) {}

  @Get()
  async findAll(
    @Query() filter: FilterCategoryPostsDto,
  ): Promise<ResponseData<CategoryPost[]>> {
    try {
      const [categories, totalElements] =
        await this.categoryPostsService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = categories.length;

      return new ResponseData<CategoryPost[]>(
        categories,
        HttpStatus.OK,
        'Successfully retrieved categories.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<CategoryPost[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve categories.',
      );
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<CategoryPost>> {
    try {
      const category: CategoryPost =
        await this.categoryPostsService.findOne(+id);
      return new ResponseData<CategoryPost>(
        category,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<CategoryPost>(
        null,
        HttpStatus.BAD_REQUEST,
        error.message,
      );
    }
  }

  @Get('findByUrl/:url')
  async findOneByUrl(
    @Param('url') url: string,
  ): Promise<ResponseData<CategoryPost>> {
    try {
      const category: CategoryPost =
        await this.categoryPostsService.findOneByUrl(url);
      return new ResponseData<CategoryPost>(
        category,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<CategoryPost>(
        null,
        HttpStatus.BAD_REQUEST,
        error.message,
      );
    }
  }
}
