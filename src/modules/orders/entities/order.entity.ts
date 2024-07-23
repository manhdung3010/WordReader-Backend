import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { OrderItem } from './orderItem.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { OrderPayStatus } from 'src/common/enums/order-pay-status.enum';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.orders)
  user: Users;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true, onDelete: 'CASCADE' })
  orderItems: OrderItem[];

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @Column({ type: 'enum', enum: OrderPayStatus })
  payStatus: OrderPayStatus;

  @Column({ type: 'decimal' })
  totalPrice: number;

  @Column({ type: 'decimal', nullable: true })
  discountPrice?: number;

  @Column({ nullable: true })
  discountCode?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
