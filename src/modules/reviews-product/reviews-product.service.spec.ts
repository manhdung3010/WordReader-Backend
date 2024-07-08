import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsProductService } from './reviews-product.service';

describe('ReviewsProductService', () => {
  let service: ReviewsProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsProductService],
    }).compile();

    service = module.get<ReviewsProductService>(ReviewsProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
