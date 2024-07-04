import { Test, TestingModule } from '@nestjs/testing';
import { CategoryPostsController } from './category-posts.controller';
import { CategoryPostsService } from './category-posts.service';

describe('CategoryPostsController', () => {
  let controller: CategoryPostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryPostsController],
      providers: [CategoryPostsService],
    }).compile();

    controller = module.get<CategoryPostsController>(CategoryPostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
