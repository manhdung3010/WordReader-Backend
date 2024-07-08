import { Module } from '@nestjs/common';
import { CategoryPostsService } from './category-posts.service';
import { CategoryPostPublicController, CategoryPostsController } from './category-posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryPost } from './entities/category-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryPost])],
  controllers: [CategoryPostsController, CategoryPostPublicController],
  providers: [CategoryPostsService],
  exports: [CategoryPostsService],

})
export class CategoryPostsModule {}
