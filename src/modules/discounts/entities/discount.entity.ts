import { DiscountType } from 'src/common/enums/discount.enum';
import { Categories } from 'src/modules/categories/entities/category.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';

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
  isFullDiscount: boolean;

  @ManyToMany(() => Categories)
  @JoinTable({
    name: 'discount_categories',
    joinColumn: { name: 'discount_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categoryDiscount: Categories[];

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;
}
