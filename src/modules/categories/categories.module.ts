import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController, CategoryProductPublicController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categories } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Categories])],
  controllers: [CategoriesController, CategoryProductPublicController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
