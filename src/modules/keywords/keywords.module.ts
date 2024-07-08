import { Module } from '@nestjs/common';
import { KeywordsService } from './keywords.service';
import { KeywordsController, KeywordsPublicController } from './keywords.controller';
import { Keyword } from './entities/keyword.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Keyword])],
  controllers: [KeywordsController,KeywordsPublicController],
  providers: [KeywordsService],
  exports: [KeywordsService],
})
export class KeywordsModule {}
