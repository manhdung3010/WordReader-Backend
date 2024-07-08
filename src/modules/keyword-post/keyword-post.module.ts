import { Module } from '@nestjs/common';
import { KeywordPostService } from './keyword-post.service';
import { KeywordPostController, KeywordPostPublicController } from './keyword-post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeywordPost } from './entities/keyword-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KeywordPost])],
  controllers: [KeywordPostController,KeywordPostPublicController],
  providers: [KeywordPostService],
  exports: [KeywordPostService],

})
export class KeywordPostModule {}
