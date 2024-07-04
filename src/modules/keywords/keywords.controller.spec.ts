import { Test, TestingModule } from '@nestjs/testing';
import { KeywordsController } from './keywords.controller';
import { KeywordsService } from './keywords.service';

describe('KeywordsController', () => {
  let controller: KeywordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeywordsController],
      providers: [KeywordsService],
    }).compile();

    controller = module.get<KeywordsController>(KeywordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
