import { Test, TestingModule } from '@nestjs/testing';
import { KeywordPostService } from './keyword-post.service';

describe('KeywordPostService', () => {
  let service: KeywordPostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeywordPostService],
    }).compile();

    service = module.get<KeywordPostService>(KeywordPostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
