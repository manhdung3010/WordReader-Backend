import { Test, TestingModule } from '@nestjs/testing';
import { CategoryPostsService } from './category-posts.service';

describe('CategoryPostsService', () => {
  let service: CategoryPostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryPostsService],
    }).compile();

    service = module.get<CategoryPostsService>(CategoryPostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
