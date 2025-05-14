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
import { MenusModule } from './modules/menus/menus.module';
import { Menu } from './modules/menus/entities/menu.entity';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { Discount } from './modules/discounts/entities/discount.entity';
import { OrdersModule } from './modules/orders/orders.module';
import { Order } from './modules/orders/entities/order.entity';
import { UserViewHistory } from './modules/users/entities/user-view-history';
import { AiModule } from './modules/ai/ai.module';
import { ReportsModule } from './modules/reports/reports.module';

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
      connectTimeout: 60000,
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
        Menu,
        Discount,
        Order,
        UserViewHistory,
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
    MenusModule,
    DiscountsModule,
    OrdersModule,
    AiModule,
    ReportsModule,
  ],
})
export class AppModule {}
