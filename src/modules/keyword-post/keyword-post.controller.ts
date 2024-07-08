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
  Put,
} from '@nestjs/common';
import { KeywordPostService } from './keyword-post.service';
import { CreateKeywordPostDto } from './dto/create-keyword-post.dto';
import { UpdateKeywordPostDto } from './dto/update-keyword-post.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthAdmin } from 'src/common/decorators/http.decorators';
import { ResponseData } from 'src/common/global/globalClass';
import { KeywordPost } from './entities/keyword-post.entity';
import { HttpMessage } from 'src/common/global/globalEnum';
import { FilterKeywordPostDto } from './dto/filter-keyword-post.dto';

@ApiTags('Admin - Keyword Post')
@Controller('api/admin/keyword-post')
export class KeywordPostController {
  constructor(private readonly keywordPostService: KeywordPostService) {}

  @AuthAdmin()
  @Post()
  async create(
    @Body() createKeywordPostDto: CreateKeywordPostDto,
  ): Promise<ResponseData<KeywordPost>> {
    try {
      const newKeyword: KeywordPost =
        await this.keywordPostService.create(createKeywordPostDto);
      return new ResponseData<KeywordPost>(
        newKeyword,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseData<KeywordPost>(
          null,
          HttpStatus.CONFLICT,
          error.message,
        );
      }
      return new ResponseData<KeywordPost>(
        null,
        HttpStatus.BAD_REQUEST,
        HttpMessage.ERROR,
      );
    }
  }

  @AuthAdmin()
  @Get()
  async findAll(
    @Query() filter: FilterKeywordPostDto,
  ): Promise<ResponseData<KeywordPost[]>> {
    try {
      const [keywords, totalElements] =
        await this.keywordPostService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = keywords.length;

      return new ResponseData<KeywordPost[]>(
        keywords,
        HttpStatus.OK,
        'Successfully retrieved keywords.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<KeywordPost[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve keywords.',
      );
    }
  }

  @AuthAdmin()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<KeywordPost>> {
    try {
      const keyword = await this.keywordPostService.findOne(+id);
      return new ResponseData<KeywordPost>(
        keyword,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<KeywordPost>(
        null,
        HttpStatus.NOT_FOUND,
        'Keyword not found.',
      );
    }
  }

  @AuthAdmin()
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateKeywordPostDto: UpdateKeywordPostDto,
  ): Promise<ResponseData<KeywordPost>> {
    try {
      const updatedKeyword = await this.keywordPostService.update(
        +id,
        updateKeywordPostDto,
      );
      return new ResponseData<KeywordPost>(
        updatedKeyword,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<KeywordPost>(
        null,
        HttpStatus.BAD_REQUEST,
        'Failed to update keyword.',
      );
    }
  }

  @AuthAdmin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.keywordPostService.remove(+id);
  }
}

@ApiTags('Public - Keyword Post')
@Controller('api/public/keyword-post')
export class KeywordPostPublicController {
  constructor(private readonly keywordPostService: KeywordPostService) {}

  @Get()
  async findAll(
    @Query() filter: FilterKeywordPostDto,
  ): Promise<ResponseData<KeywordPost[]>> {
    try {
      const [keywords, totalElements] =
        await this.keywordPostService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = keywords.length;

      return new ResponseData<KeywordPost[]>(
        keywords,
        HttpStatus.OK,
        'Successfully retrieved keywords.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<KeywordPost[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve keywords.',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<KeywordPost>> {
    try {
      const keyword = await this.keywordPostService.findOne(+id);
      return new ResponseData<KeywordPost>(
        keyword,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<KeywordPost>(
        null,
        HttpStatus.NOT_FOUND,
        'Keyword not found.',
      );
    }
  }
}
