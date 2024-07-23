import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpStatus,
  ConflictException,
  Put,
} from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { ApiTags } from '@nestjs/swagger';
import { FilterAuthorDto } from './dto/filter-author.dto';
import { ResponseData } from 'src/common/global/globalClass';
import { Author } from './entities/author.entity';
import { HttpMessage } from 'src/common/global/globalEnum';
import { AuthAdmin } from 'src/common/decorators/http.decorators';

@ApiTags('Admin - Author')
@Controller('api/admin/authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @AuthAdmin()
  @Post()
  async create(
    @Body() ceateAuthorDto: CreateAuthorDto,
  ): Promise<ResponseData<Author>> {
    try {
      const newAuthor: Author =
        await this.authorsService.create(ceateAuthorDto);
      return new ResponseData<Author>(
        newAuthor,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseData<Author>(
          null,
          HttpStatus.CONFLICT,
          error.message,
        );
      }
      return new ResponseData<Author>(
        null,
        HttpStatus.BAD_REQUEST,
        error.message,
      );
    }
  }

  @AuthAdmin()
  @Get()
  async findAll(
    @Query() filter: FilterAuthorDto,
  ): Promise<ResponseData<Author[]>> {
    try {
      const [authors, totalElements] =
        await this.authorsService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = authors.length;

      return new ResponseData<Author[]>(
        authors,
        HttpStatus.OK,
        'Successfully retrieved author.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<Author[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve author.',
      );
    }
  }

  @AuthAdmin()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<Author>> {
    try {
      const author = await this.authorsService.findOne(+id);
      return new ResponseData<Author>(
        author,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<Author>(
        null,
        HttpStatus.NOT_FOUND,
        'Author not found.',
      );
    }
  }

  @AuthAdmin()
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ): Promise<ResponseData<Author>> {
    try {
      const updatedAuthor = await this.authorsService.update(
        +id,
        updateAuthorDto,
      );
      return new ResponseData<Author>(
        updatedAuthor,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<Author>(
        null,
        HttpStatus.BAD_REQUEST,
        'Failed to update author.',
      );
    }
  }

  @AuthAdmin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authorsService.remove(+id);
  }
}
