import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { ReviewsProductService } from './reviews-product.service';
import { CreateReviewsProductDto } from './dto/create-reviews-product.dto';
import { UpdateReviewsProductDto } from './dto/update-reviews-product.dto';
import { ResponseData } from 'src/common/global/globalClass';
import { HttpMessage } from 'src/common/global/globalEnum';
import { ApiTags } from '@nestjs/swagger';
import { AuthAdmin, AuthUser } from 'src/common/decorators/http.decorators';

@ApiTags('Admin - Review Product')
@Controller('api/admin/reviews-product')
export class ReviewsProductController {
  constructor(private readonly reviewsProductService: ReviewsProductService) {}

  @AuthAdmin()
  @Post()
  async create(
    @Body() createReviewsProductDto: CreateReviewsProductDto,
    @Req() req: any,
  ) {
    try {
      const user = req.user;
      const createdReview = await this.reviewsProductService.create(
        createReviewsProductDto,
        user,
      );
      return new ResponseData(
        createdReview,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
    }
  }

  @AuthAdmin()
  @Get()
  async findAll() {
    try {
      const reviews = await this.reviewsProductService.findAll();
      return new ResponseData(reviews, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
    }
  }

  @AuthAdmin()
  @Get('/findByProductId/:idProduct')
  async findByProductId(
    @Param('idProduct') idProduct: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    try {
      const result = await this.reviewsProductService.findByProductId(
        +idProduct,
        +page,
        +pageSize,
      );
      return new ResponseData(result, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
    }
  }

  @AuthAdmin()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const review = await this.reviewsProductService.findOne(+id);
      return new ResponseData(review, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
    }
  }

  @AuthAdmin()
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReviewsProductDto: UpdateReviewsProductDto,
  ) {
    try {
      const updatedReview = await this.reviewsProductService.update(
        +id,
        updateReviewsProductDto,
      );
      return new ResponseData(
        updatedReview,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
    }
  }

  @AuthAdmin()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.reviewsProductService.remove(+id);
      return new ResponseData(null, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
    }
  }
}

@ApiTags('Public - Review Product')
@Controller('/api/public/reviews-product')
export class PublicReviewsProductController {
  constructor(private readonly reviewsProductService: ReviewsProductService) {}

  @AuthUser()
  @Post()
  async create(
    @Body() createReviewsProductDto: CreateReviewsProductDto,
    @Req() req: any,
  ) {
    try {
      const user = req.user;

      const createdReview = await this.reviewsProductService.create(
        createReviewsProductDto,
        user,
      );
      return new ResponseData(
        createdReview,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
    }
  }

  @Get()
  async findAll() {
    try {
      const reviews = await this.reviewsProductService.findAll();
      return new ResponseData(reviews, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
    }
  }

  @Get('/findByProductId/:idProduct')
  async findByProductId(
    @Param('idProduct') idProduct: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    try {
      const result = await this.reviewsProductService.findByProductId(
        +idProduct,
        +page,
        +pageSize,
      );
      return new ResponseData(result, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const review = await this.reviewsProductService.findOne(+id);
      return new ResponseData(review, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, HttpMessage.ERROR);
    }
  }
}
