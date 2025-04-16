import { CategoryPost } from 'src/modules/category-posts/entities/category-post.entity';
import { KeywordPost } from 'src/modules/keyword-post/entities/keyword-post.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Posts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  content: string;

  @Column()
  url: string;

  @Column()
  display: boolean;

  @Column()
  homeDisplay: boolean;

  @Column()
  thumbnail: string;

  @Column('json', { nullable: true })
  image: string[];

  @Column()
  author: string;

  @Column()
  authorImage: string;

  @Column({ type: 'int', default: 0 })
  view: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @ManyToMany(() => KeywordPost)
  @JoinTable({
    name: 'post_keywords',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'keyword_id', referencedColumnName: 'id' },
  })
  keywords: KeywordPost[];

  @ManyToMany(() => CategoryPost)
  @JoinTable({
    name: 'post_categories',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_post_id', referencedColumnName: 'id' },
  })
  categories: CategoryPost[];

  @Column('json', { nullable: true })
  seo?: {
    title: string;
    description: string;
  };
}
