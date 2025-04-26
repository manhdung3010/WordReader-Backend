import { Product } from 'src/modules/products/entities/product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class ReviewsProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.reviews)
  product: Product;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  star: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: true })
  display: boolean;

  @Column({ type: 'json', nullable: true })
  image: string[];

  @Column()
  author: string;

  @Column()
  authorImage: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
