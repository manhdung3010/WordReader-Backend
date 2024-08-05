import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  ConflictException,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseData } from 'src/common/global/globalClass';
import { Users } from './entities/users.entity';
import { HttpMessage } from 'src/common/global/globalEnum';
import { AuthAdmin } from 'src/common/decorators/http.decorators';
import { ApiTags } from '@nestjs/swagger';
import { FilterUserDto } from './dto/filter-user.dto';

@ApiTags('Admin - User')
@Controller('api/admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @AuthAdmin()
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ResponseData<Users>> {
    try {
      const newUser: Users = await this.usersService.create(createUserDto);
      return new ResponseData<Users>(
        newUser,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseData<Users>(
          null,
          HttpStatus.CONFLICT,
          error.message,
        );
      }
      return new ResponseData<Users>(
        null,
        HttpStatus.BAD_REQUEST,
        error.message,
      );
    }
  }

  @AuthAdmin()
  @Get()
  async findAll(
    @Query() filter: FilterUserDto,
  ): Promise<ResponseData<Users[]>> {
    try {
      const [users, totalElements] = await this.usersService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = users.length;

      return new ResponseData<Users[]>(
        users,
        HttpStatus.OK,
        'Successfully retrieved users.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<Users[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve users.',
      );
    }
  }

  @AuthAdmin()
  @Get('/getStats')
  async getUserStats(): Promise<ResponseData<any>> {
    try {
      const result = await this.usersService.getUserStats();
      if (typeof result === 'string') {
        return new ResponseData<any>(null, HttpStatus.NOT_FOUND, result);
      }
      return new ResponseData<any>(result, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData<any>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message,
      );
    }
  }

  @AuthAdmin()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<Users>> {
    try {
      const result = await this.usersService.findOne(+id);
      if (typeof result === 'string') {
        return new ResponseData<Users>(null, HttpStatus.NOT_FOUND, result);
      }
      return new ResponseData<Users>(
        result,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<Users>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message,
      );
    }
  }

  @AuthAdmin()
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @AuthAdmin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
