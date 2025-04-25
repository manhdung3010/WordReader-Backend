import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class CategoryPost {
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

  @Column({ nullable: true })
  image: string;

  @Column('json', { nullable: true })
  seo?: {
    title: string;
    description: string;
  };

  // Many-to-Many self-referencing relationship for parents
  @ManyToMany(() => CategoryPost, (categories) => categories.children)
  @JoinTable({
    name: 'category_post_parents',
    joinColumn: { name: 'child_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'parent_id', referencedColumnName: 'id' },
  })
  parents: CategoryPost[];

  // Many-to-Many self-referencing relationship for children
  @ManyToMany(() => CategoryPost, (categories) => categories.parents)
  children: CategoryPost[];
}
