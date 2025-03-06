import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Menu {
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

  @Column({ nullable: true, default: '' })
  image: string;

  @Column('json', { nullable: true })
  seo?: {
    title: string;
    description: string;
  };

  // Many-to-Many self-referencing relationship for parents
  @ManyToMany(() => Menu, (categories) => categories.children)
  @JoinTable({
    name: 'menu_parents',
    joinColumn: { name: 'child_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'parent_id', referencedColumnName: 'id' },
  })
  parents: Menu[];

  // Many-to-Many self-referencing relationship for children
  @ManyToMany(() => Menu, (categories) => categories.parents)
  children: Menu[];
}
