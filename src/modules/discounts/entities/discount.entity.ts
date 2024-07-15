import { DiscountType } from 'src/common/enums/discount.enum';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  active: boolean;

  @Column()
  display: boolean;

  @Column({
    type: 'enum',
    enum: DiscountType,
  })
  discountType: DiscountType;

  @Column()
  price: number;

  @Column()
  usageLimit: number;

  @Column()
  maxDiscount?: number;

  @Column()
  minPurchase?: number;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;
}
