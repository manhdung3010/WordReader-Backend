import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsProductController } from './reviews-product.controller';
import { ReviewsProductService } from './reviews-product.service';

describe('ReviewsProductController', () => {
  let controller: ReviewsProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsProductController],
      providers: [ReviewsProductService],
    }).compile();

    controller = module.get<ReviewsProductController>(ReviewsProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
