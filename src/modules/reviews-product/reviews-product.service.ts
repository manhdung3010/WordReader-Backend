/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateReviewsProductDto } from './dto/create-reviews-product.dto';
import { UpdateReviewsProductDto } from './dto/update-reviews-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewsProduct } from './entities/reviews-product.entity';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ReviewsProductService {
  constructor(
    @InjectRepository(ReviewsProduct)
    private reviewsProductRepository: Repository<ReviewsProduct>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(
    createReviewsProductDto: CreateReviewsProductDto,
    user: any,
  ): Promise<ReviewsProduct> {
    const newReviewsProduct = this.reviewsProductRepository.create(
      createReviewsProductDto,
    );
    const { productId, ...rest } = createReviewsProductDto;
    newReviewsProduct.product = { id: productId } as any;

    newReviewsProduct.author = user.fullName;
    newReviewsProduct.authorImage = user.avatar;

    return await this.reviewsProductRepository.save(newReviewsProduct);
  }

  async findAll(): Promise<ReviewsProduct[]> {
    return await this.reviewsProductRepository.find({ relations: ['product'] });
  }

  async findByProductId(
    productId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: ReviewsProduct[]; total: number }> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    const [data, total] = await this.reviewsProductRepository.findAndCount({
      where: { product: { id: productId } },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: number): Promise<ReviewsProduct> {
    const reviews = await this.reviewsProductRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!reviews) {
      throw new Error(`reviews with ID ${id} not found`);
    }
    return reviews;
  }

  async update(
    id: number,
    updateReviewsProductDto: UpdateReviewsProductDto,
  ): Promise<ReviewsProduct> {
    await this.reviewsProductRepository.update(id, updateReviewsProductDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.reviewsProductRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Review with ID ${id} not found`);
    }
  }
}
