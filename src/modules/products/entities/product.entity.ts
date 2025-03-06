import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';
import { InfoProduct } from './info-product.entity';
import { Categories } from 'src/modules/categories/entities/category.entity';
import { Keyword } from 'src/modules/keywords/entities/keyword.entity';
import { productWarehouse } from './product-warehouse.entity';
import { ReviewsProduct } from 'src/modules/reviews-product/entities/reviews-product.entity';
import { StatusProduct } from 'src/common/enums/product-status.enum';
import { UserViewHistory } from 'src/modules/users/entities/user-view-history';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  url: string;

  @Column()
  display: boolean;

  @Column({
    type: 'enum',
    enum: StatusProduct,
  })
  status: StatusProduct;

  @Column()
  avatar: string;

  @Column({ default: 0 })
  averageStarRating: number;

  @Column()
  price: number;

  @Column()
  discountPrice: number;

  @Column()
  perDiscount: number;

  @Column({ type: 'json', nullable: true })
  image: string[];

  @OneToMany(() => ReviewsProduct, (reviews) => reviews.product)
  reviews: ReviewsProduct[];

  @OneToMany(() => InfoProduct, (info) => info.product)
  information: InfoProduct[];

  @OneToOne(
    () => productWarehouse,
    (productWarehouse) => productWarehouse.product,
  )
  productWarehouse: productWarehouse;

  @ManyToMany(() => Categories)
  @JoinTable({
    name: 'product_categories',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Categories[];

  @Column({ type: 'json', nullable: true })
  flashSale?: {
    flashSaleStartTime: Date;
    flashSaleEndTime: Date;
    flashSaleDiscount: number;
    flashSalePrice: number;
  };

  @ManyToMany(() => Keyword)
  @JoinTable({
    name: 'product_keywords',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'keyword_id', referencedColumnName: 'id' },
  })
  keywords: Keyword[];

  @Column({ type: 'json', nullable: true })
  seo?: {
    title: string;
    description: string;
  };

  @OneToMany(() => UserViewHistory, (viewHistory) => viewHistory.product)
  viewHistory: UserViewHistory[];
}
