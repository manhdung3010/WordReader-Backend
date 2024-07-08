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
import { productWarehouse } from './modules/products/entities/product-warehouse.entity';
import { PostsModule } from './modules/posts/posts.module';
import { KeywordPostModule } from './modules/keyword-post/keyword-post.module';
import { KeywordPost } from './modules/keyword-post/entities/keyword-post.entity';
import { Posts } from './modules/posts/entities/post.entity';
import { FilesModule } from './modules/files/files.module';
import { ConfigModule } from '@nestjs/config';
import { ReviewsProductModule } from './modules/reviews-product/reviews-product.module';
import { ReviewsProduct } from './modules/reviews-product/entities/reviews-product.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DBNAME,
      entities: [
        Users,
        Categories,
        Product,
        InfoProduct,
        Author,
        Keyword,
        CategoryPost,
        productWarehouse,
        KeywordPost,
        Posts,
        ReviewsProduct,
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
    PostsModule,
    KeywordPostModule,
    FilesModule,
    ReviewsProductModule,
  ],
})
export class AppModule {}
