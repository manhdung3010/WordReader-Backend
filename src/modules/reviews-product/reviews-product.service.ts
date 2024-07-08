import { Injectable, NotFoundException } from '@nestjs/common';
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
  ): Promise<ReviewsProduct> {
    const newReviewsProduct = this.reviewsProductRepository.create(
      createReviewsProductDto,
    );
    const { productId, ...rest } = createReviewsProductDto;
    newReviewsProduct.product = { id: productId } as any;
    return await this.reviewsProductRepository.save(newReviewsProduct);
  }

  async findAll(): Promise<ReviewsProduct[]> {
    return await this.reviewsProductRepository.find({ relations: ['product'] });
  }

  async findByProductId(productId: number): Promise<ReviewsProduct[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return await this.reviewsProductRepository.find({
      where: { product: { id: productId } },
      relations: ['product'],
    });
  }

  async findOne(id: number): Promise<ReviewsProduct> {
    const reviews = await this.reviewsProductRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!reviews) {
      throw new NotFoundException(`reviews with ID ${id} not found`);
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
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
  }
}
