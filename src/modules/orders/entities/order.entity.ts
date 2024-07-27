import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { Users } from 'src/modules/users/entities/users.entity';
import { OrderPayStatus } from 'src/common/enums/order-pay-status.enum';
import { AddressType } from 'src/common/enums/address.enum';
import { Product } from 'src/modules/products/entities/product.entity';

interface OrderItem {
  quantity: number;
  product: Product
}


@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.orders)
  user: Users;

  @Column({ type: 'json' })
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

  @Column({ type: 'json', nullable: true })
  shipping?: {
    name: string;
    phone: string;
    address: string;
    streetName: string;
    addressType: AddressType;
  };
}
