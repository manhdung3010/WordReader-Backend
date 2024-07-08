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
} from '@nestjs/common';
import { ReviewsProductService } from './reviews-product.service';
import { CreateReviewsProductDto } from './dto/create-reviews-product.dto';
import { UpdateReviewsProductDto } from './dto/update-reviews-product.dto';
import { ResponseData } from 'src/common/global/globalClass';
import { HttpMessage } from 'src/common/global/globalEnum';
import { ApiTags } from '@nestjs/swagger';
import { AuthAdmin } from 'src/common/decorators/http.decorators';

@ApiTags('Admin - Review Product')
@Controller('reviews-product')
export class ReviewsProductController {
  constructor(private readonly reviewsProductService: ReviewsProductService) {}

  @AuthAdmin()
  @Post()
  async create(@Body() createReviewsProductDto: CreateReviewsProductDto) {
    try {
      const updatedProduct = await this.reviewsProductService.create(
        createReviewsProductDto,
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
  @Get()
  async findAll() {
    try {
      const updatedProduct = await this.reviewsProductService.findAll();
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
  @Get('/findByProductId/:idProduct')
  findByProductId(@Param('idProduct') idProduct: string) {
    try {
      const updatedProduct =
        this.reviewsProductService.findByProductId(+idProduct);
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
  @Get(':id')
  findOne(@Param('id') id: string) {
    try {
      const updatedProduct = this.reviewsProductService.findOne(+id);
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
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateReviewsProductDto: UpdateReviewsProductDto,
  ) {
    try {
      const updatedProduct = this.reviewsProductService.update(
        +id,
        updateReviewsProductDto,
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
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsProductService.remove(+id);
  }
}

@ApiTags('Public - Review Product')
@Controller('reviews-product')
export class PublicReviewsProductController {
  constructor(private readonly reviewsProductService: ReviewsProductService) {}

  @Get()
  async findAll() {
    try {
      const updatedProduct = await this.reviewsProductService.findAll();
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

  @Get('/findByProductId/:idProduct')
  findByProductId(@Param('idProduct') idProduct: string) {
    try {
      const updatedProduct =
        this.reviewsProductService.findByProductId(+idProduct);
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    try {
      const updatedProduct = this.reviewsProductService.findOne(+id);
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
}
