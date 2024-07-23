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
import { KeywordsService } from './keywords.service';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';
import { ResponseData } from 'src/common/global/globalClass';
import { Keyword } from './entities/keyword.entity';
import { HttpMessage } from 'src/common/global/globalEnum';
import { FilterKeywordDto } from './dto/filter-keyword.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthAdmin } from 'src/common/decorators/http.decorators';

@ApiTags('Admin - Keyword Product')
@Controller('api/admin/keyword-product')
export class KeywordsController {
  constructor(private readonly keywordsService: KeywordsService) {}

  @AuthAdmin()
  @Post()
  async create(
    @Body() createKeywordDto: CreateKeywordDto,
  ): Promise<ResponseData<Keyword>> {
    try {
      const newKeyword: Keyword =
        await this.keywordsService.create(createKeywordDto);
      return new ResponseData<Keyword>(
        newKeyword,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseData<Keyword>(
          null,
          HttpStatus.CONFLICT,
          error.message,
        );
      }
      return new ResponseData<Keyword>(
        null,
        HttpStatus.BAD_REQUEST,
        error.message,
      );
    }
  }

  @AuthAdmin()
  @Get()
  async findAll(
    @Query() filter: FilterKeywordDto,
  ): Promise<ResponseData<Keyword[]>> {
    try {
      const [keywords, totalElements] =
        await this.keywordsService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = keywords.length;

      return new ResponseData<Keyword[]>(
        keywords,
        HttpStatus.OK,
        'Successfully retrieved keywords.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<Keyword[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve keywords.',
      );
    }
  }

  @AuthAdmin()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<Keyword>> {
    try {
      const keyword = await this.keywordsService.findOne(+id);
      return new ResponseData<Keyword>(
        keyword,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<Keyword>(
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
    @Body() updateKeywordDto: UpdateKeywordDto,
  ): Promise<ResponseData<Keyword>> {
    try {
      const updatedKeyword = await this.keywordsService.update(
        +id,
        updateKeywordDto,
      );
      return new ResponseData<Keyword>(
        updatedKeyword,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<Keyword>(
        null,
        HttpStatus.BAD_REQUEST,
        'Failed to update keyword.',
      );
    }
  }

  @AuthAdmin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.keywordsService.remove(+id);
  }
}

@ApiTags('Public - Keyword Product')
@Controller('api/public/keyword-product')
export class KeywordsPublicController {
  constructor(private readonly keywordsService: KeywordsService) {}

  @Get()
  async findAll(
    @Query() filter: FilterKeywordDto,
  ): Promise<ResponseData<Keyword[]>> {
    try {
      const [keywords, totalElements] =
        await this.keywordsService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = keywords.length;

      return new ResponseData<Keyword[]>(
        keywords,
        HttpStatus.OK,
        'Successfully retrieved keywords.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<Keyword[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve keywords.',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<Keyword>> {
    try {
      const keyword = await this.keywordsService.findOne(+id);
      return new ResponseData<Keyword>(
        keyword,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<Keyword>(
        null,
        HttpStatus.NOT_FOUND,
        'Keyword not found.',
      );
    }
  }
}
