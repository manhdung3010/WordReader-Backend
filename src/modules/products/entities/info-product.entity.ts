import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class InfoProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.information, { onDelete: 'CASCADE' })
  product: Product;  

  @Column()
  name: string;

  @Column({ nullable: true }) 
  content?: string;
}
