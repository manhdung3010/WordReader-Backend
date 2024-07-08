import { Test, TestingModule } from '@nestjs/testing';
import { KeywordPostController } from './keyword-post.controller';
import { KeywordPostService } from './keyword-post.service';

describe('KeywordPostController', () => {
  let controller: KeywordPostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeywordPostController],
      providers: [KeywordPostService],
    }).compile();

    controller = module.get<KeywordPostController>(KeywordPostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
