import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { Users } from './modules/users/entities/users.entity';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { Categories } from './modules/categories/entities/category.entity';
import { ProductsModule } from './modules/products/products.module';
import { AuthorsModule } from './modules/authors/authors.module';
import { Author } from './modules/authors/entities/author.entity';
import { Product } from './modules/products/entities/product.entity';
import { InfoProduct } from './modules/products/entities/info-product.entity';
import { KeywordsModule } from './modules/keywords/keywords.module';
import { Keyword } from './modules/keywords/entities/keyword.entity';
import { CategoryPostsModule } from './modules/category-posts/category-posts.module';
import { CategoryPost } from './modules/category-posts/entities/category-post.entity';
import { ProductWareHouse } from './modules/products/entities/product-warehouse.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'world_reader',
      entities: [
        Users,
        Categories,
        Product,
        InfoProduct,
        Author,
        Keyword,
        CategoryPost,
        ProductWareHouse,
      ],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    AuthorsModule,
    KeywordsModule,
    CategoryPostsModule,
  ],
})
export class AppModule {}
