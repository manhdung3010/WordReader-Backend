import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Categories {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  url: string;

  @Column()
  display: boolean;

  @Column()
  homeDisplay: boolean;

  @Column()
  image: string;

  @Column('json', { nullable: true })
  seo?: {
    title: string;
    description: string;
  };

  // Many-to-Many self-referencing relationship for parents
  @ManyToMany(() => Categories, (categories) => categories.children)
  @JoinTable({
    name: 'category_parents',
    joinColumn: { name: 'child_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'parent_id', referencedColumnName: 'id' },
  })
  parents: Categories[];

  // Many-to-Many self-referencing relationship for children
  @ManyToMany(() => Categories, (categories) => categories.parents)
  children: Categories[];
}
