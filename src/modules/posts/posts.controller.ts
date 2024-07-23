import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  ConflictException,
  Query,
  Req,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthAdmin } from 'src/common/decorators/http.decorators';
import { ResponseData } from 'src/common/global/globalClass';
import { HttpMessage } from 'src/common/global/globalEnum';
import { Posts } from './entities/post.entity';
import { FilterPostDto } from './dto/filter-post.dto';
import { ApiTags } from '@nestjs/swagger';
import { FilterPaginationDto } from './dto/filter-pagination';

@ApiTags('Admin - Post')
@Controller('/api/admin/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @AuthAdmin()
  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: any,
  ): Promise<ResponseData<Posts>> {
    try {
      const user = req.user;

      const newPost: Posts = await this.postsService.create(
        createPostDto,
        user,
      );
      return new ResponseData<Posts>(
        newPost,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseData<Posts>(
          null,
          HttpStatus.CONFLICT,
          error.message,
        );
      }
      return new ResponseData<Posts>(
        null,
        HttpStatus.BAD_REQUEST,
        error.message,
      );
    }
  }

  @AuthAdmin()
  @Get()
  async findAll(
    @Query() filter: FilterPostDto,
  ): Promise<ResponseData<Posts[]>> {
    try {
      const [posts, totalElements] = await this.postsService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = posts.length;

      return new ResponseData<Posts[]>(
        posts,
        HttpStatus.OK,
        'Successfully retrieved users.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<Posts[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve categories.',
      );
    }
  }

  @AuthAdmin()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<Posts>> {
    try {
      const post = await this.postsService.findOne(+id);
      return new ResponseData<Posts>(post, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData<Posts>(
        null,
        HttpStatus.NOT_FOUND,
        'Post not found.',
      );
    }
  }

  @AuthAdmin()
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<ResponseData<Posts>> {
    try {
      const updatedPost = await this.postsService.update(+id, updatePostDto);
      return new ResponseData<Posts>(
        updatedPost,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<Posts>(
        null,
        HttpStatus.BAD_REQUEST,
        'Failed to update post.',
      );
    }
  }

  @AuthAdmin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}

@ApiTags('Public - Post')
@Controller('/api/public/posts')
export class PostsPublicController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(
    @Query() filter: FilterPostDto,
  ): Promise<ResponseData<Posts[]>> {
    try {
      const [posts, totalElements] = await this.postsService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = posts.length;

      return new ResponseData<Posts[]>(
        posts,
        HttpStatus.OK,
        'Successfully retrieved users.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<Posts[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve categories.',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<Posts>> {
    try {
      const post = await this.postsService.findOne(+id);
      return new ResponseData<Posts>(post, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData<Posts>(
        null,
        HttpStatus.NOT_FOUND,
        'Post not found.',
      );
    }
  }

  @Get('/findByKeyword/:keywordCode')
  async findByKeyword(
    @Param('keywordCode') keywordCode: string,
    @Query() filter: FilterPaginationDto,
  ): Promise<ResponseData<Posts[]>> {
    try {
      const [posts, totalElements] = await this.postsService.findByKeyword(
        keywordCode,
        filter,
      );

      const pageSize = filter.pageSize || 20;
      const totalPages = Math.ceil(totalElements / pageSize);
      const size = posts.length;

      return new ResponseData<Posts[]>(
        posts,
        HttpStatus.OK,
        'Successfully retrieved posts.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        return new ResponseData(null, HttpStatus.NOT_FOUND, 'Posts not found.');
      }
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
    }
  }

  @Get('/findByCategory/:urlCategory')
  async findByCategory(
    @Param('urlCategory') urlCategory: string,
    @Query() filter: FilterPaginationDto,
  ): Promise<ResponseData<Posts[]>> {
    try {
      const [posts, totalElements] = await this.postsService.findByCategory(
        urlCategory,
        filter,
      );

      const pageSize = filter.pageSize || 20;
      const totalPages = Math.ceil(totalElements / pageSize);
      const size = posts.length;

      return new ResponseData<Posts[]>(
        posts,
        HttpStatus.OK,
        'Successfully retrieved posts.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        return new ResponseData(null, HttpStatus.NOT_FOUND, 'Posts not found.');
      }
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
    }
  }
}
