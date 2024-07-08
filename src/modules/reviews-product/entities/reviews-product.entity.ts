import { Product } from 'src/modules/products/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class ReviewsProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, product => product.reviews)
  product: Product;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  star: number;

  @Column({ type: 'text' })
  content: string;

  @Column()
  display: boolean;

  @Column({ type: 'json', nullable: true })
  image: string[];
}
