import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class KeywordPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string
}
