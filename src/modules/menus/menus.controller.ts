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
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthAdmin } from 'src/common/decorators/http.decorators';
import { ResponseData } from 'src/common/global/globalClass';
import { Menu } from './entities/menu.entity';
import { HttpMessage } from 'src/common/global/globalEnum';
import { FilterMenuDto } from './dto/filter-menu.dto';

@ApiTags('Admin - Menu')
@Controller('api/admin/menu')
export class MenusController {
  constructor(private readonly menuService: MenusService) {}

  @AuthAdmin()
  @Post()
  async create(
    @Body() createCategoryPostDto: CreateMenuDto,
  ): Promise<ResponseData<Menu>> {
    try {
      const newMenu: Menu = await this.menuService.create(
        createCategoryPostDto,
      );
      return new ResponseData<Menu>(
        newMenu,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseData<Menu>(null, HttpStatus.CONFLICT, error.message);
      }
      return new ResponseData<Menu>(
        null,
        HttpStatus.BAD_REQUEST,
        HttpMessage.ERROR,
      );
    }
  }

  @AuthAdmin()
  @Get()
  async findAll(@Query() filter: FilterMenuDto): Promise<ResponseData<Menu[]>> {
    try {
      const [menus, totalElements] =
        await this.menuService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = menus.length;

      return new ResponseData<Menu[]>(
        menus,
        HttpStatus.OK,
        'Successfully retrieved menus.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<Menu[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve menus.',
      );
    }
  }
  @AuthAdmin()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<Menu>> {
    try {
      const menu: Menu = await this.menuService.findOne(+id);
      return new ResponseData<Menu>(
        menu,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseData<Menu>(null, HttpStatus.CONFLICT, error.message);
      }
      return new ResponseData<Menu>(
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
    @Body() updateMenuDto: UpdateMenuDto,
  ): Promise<ResponseData<Menu>> {
    try {
      const menu: Menu = await this.menuService.update(
        +id,
        updateMenuDto,
      );
      return new ResponseData<Menu>(
        menu,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseData<Menu>(null, HttpStatus.CONFLICT, error.message);
      }
      return new ResponseData<Menu>(
        null,
        HttpStatus.BAD_REQUEST,
        HttpMessage.ERROR,
      );
    }
  }

  @AuthAdmin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuService.remove(+id);
  }
}

@ApiTags('Public - Menu')
@Controller('api/public/menu')
export class MenuPublicController {
  constructor(private readonly menuService: MenusService) {}

  @Get()
  async findAll(@Query() filter: FilterMenuDto): Promise<ResponseData<Menu[]>> {
    try {
      const [menus, totalElements] =
        await this.menuService.findAll(filter);
      const totalPages = Math.ceil(totalElements / (filter.pageSize || 20));
      const size = menus.length;

      return new ResponseData<Menu[]>(
        menus,
        HttpStatus.OK,
        'Successfully retrieved menus.',
        totalElements,
        totalPages,
        size,
      );
    } catch (error) {
      return new ResponseData<Menu[]>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve menus.',
      );
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<Menu>> {
    try {
      const menu: Menu = await this.menuService.findOne(+id);
      return new ResponseData<Menu>(
        menu,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseData<Menu>(null, HttpStatus.CONFLICT, error.message);
      }
      return new ResponseData<Menu>(
        null,
        HttpStatus.BAD_REQUEST,
        HttpMessage.ERROR,
      );
    }
  }
}
