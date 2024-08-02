import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Gender } from 'src/common/enums/gender.enum';
import { Role } from 'src/common/enums/role.enum';
import { Order } from 'src/modules/orders/entities/order.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  username: string | null;  // Make username nullable to handle cases where it's not provided

  @Column({ nullable: true })
  googleId: string | null;

  @Exclude()
  @Column({ nullable: true })
  password: string | null;  // Make password nullable for users registered via Google

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string | null;

  @Column('date', { nullable: true })
  date: Date | null;

  @Column({ nullable: true })
  address: string | null;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender | null;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
  })
  role: Role;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
