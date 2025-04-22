import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('date', { nullable: true })
  date: Date;

  @Column()
  nationality: string;

  @Column({ type: 'text', nullable: true })
  biography: string;

  @Column({ nullable: true })
  image: string;
}
