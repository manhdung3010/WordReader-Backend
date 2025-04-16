import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController, PostsPublicController } from './posts.controller';
import { Posts } from './entities/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryPost } from '../category-posts/entities/category-post.entity';
import { KeywordPost } from '../keyword-post/entities/keyword-post.entity';
import { Users } from '../users/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Posts, CategoryPost, KeywordPost, Users])],
  controllers: [PostsController, PostsPublicController],
  providers: [PostsService],
  exports: [PostsService],

})
export class PostsModule {}
