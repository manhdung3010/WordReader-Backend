import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Product } from 'src/modules/products/entities/product.entity';
import { Users } from './users.entity';

@Entity()
export class UserViewHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.viewHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Index()
  user: Users;

  @ManyToOne(() => Product, (product) => product.viewHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  @Index()
  product: Product;

  @CreateDateColumn()
  viewTime: Date;

  @Column({ type: 'int', nullable: true })
  duration?: number; // Thời gian xem sản phẩm (tính bằng giây)

  @Column({ type: 'varchar', length: 50 })
  device: string; // Thiết bị sử dụng

  @Column({ type: 'varchar', length: 100 })
  referrer: string; // Nguồn truy cập (Google, Facebook,...)
}
