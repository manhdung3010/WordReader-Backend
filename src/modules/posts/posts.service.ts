import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Posts } from './entities/post.entity';
import { CategoryPost } from '../category-posts/entities/category-post.entity';
import { KeywordPost } from '../keyword-post/entities/keyword-post.entity';
import { FilterPostDto } from './dto/filter-post.dto';
import { FilterPaginationDto } from './dto/filter-pagination';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private readonly postRepository: Repository<Posts>,

    @InjectRepository(CategoryPost)
    private readonly categoryPostRepository: Repository<CategoryPost>,

    @InjectRepository(KeywordPost)
    private readonly keywordPostRepository: Repository<KeywordPost>,
  ) {}

  async create(createPostDto: CreatePostDto, user: any): Promise<Posts> {
    const { keywords, categories, ...postData } = createPostDto;

    // Create a new post instance
    const newPost = new Posts();
    newPost.name = postData.name;
    newPost.content = postData.content;
    newPost.url = postData.url;
    newPost.display = postData.display;
    newPost.homeDisplay = postData.homeDisplay;
    newPost.thumbnail = postData.thumbnail;
    newPost.image = postData.image;
    newPost.seo = postData.seo;
    newPost.createdAt = new Date();
    newPost.updatedAt = null;
    newPost.author = user.fullName; // Replace with logic to get author from token

    // If categories are provided, fetch and associate them with the new post
    if (categories && categories.length > 0) {
      const fetchedCategories =
        await this.categoryPostRepository.findByIds(categories);
      newPost.categories = fetchedCategories;
    }

    // If keywords are provided, fetch and associate them with the new post
    if (keywords && keywords.length > 0) {
      const fetchedKeywords =
        await this.keywordPostRepository.findByIds(keywords);
      newPost.keywords = fetchedKeywords;
    }

    // Save the new post to the database
    const savedPost = await this.postRepository.save(newPost);
    return savedPost;
  }

  async findAll(filter: FilterPostDto): Promise<[Posts[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const whereClause = this.buildWhereClause(filter);

    const options: FindManyOptions<Posts> = {
      relations: ['categories', 'keywords'],
      where: whereClause,
      skip: skip,
      take: pageSize,
    };

    try {
      const [posts, totalElements] =
        await this.postRepository.findAndCount(options);
      return [posts, totalElements];
    } catch (error) {
      // Handle error appropriately
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }
  }

  private buildWhereClause(filter: Partial<FilterPostDto>): any {
    const where: any = {};

    if (filter.name) {
      where.name = filter.name;
    }

    if (filter.url) {
      where.url = filter.url;
    }

    if (filter.author) {
      where.author = filter.author;
    }

    if (typeof filter.display === 'boolean') {
      where.display = filter.display;
    } else if (typeof filter.display === 'string') {
      where.display = filter.display === 'true';
    }

    if (typeof filter.homeDisplay === 'boolean') {
      where.homeDisplay = filter.homeDisplay;
    } else if (typeof filter.homeDisplay === 'string') {
      where.homeDisplay = filter.homeDisplay === 'true';
    }

    return where;
  }

  async findOne(id: number): Promise<Posts> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['categories', 'keywords'],
    });
    if (!post) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return post;
  }

  async findByKeyword(
    keywordCode: string,
    filter: FilterPaginationDto,
  ): Promise<[Posts[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // Tìm keyword theo keywordCode
    const keyword = await this.keywordPostRepository.findOne({
      where: { code: keywordCode },
    });

    if (!keyword) {
      throw new Error(`Keyword with code ${keywordCode} not found`);
    }

    // Tìm các bài viết liên quan đến keyword
    const [posts, totalElements] = await this.postRepository
      .createQueryBuilder('posts')
      .leftJoinAndSelect('posts.keywords', 'keyword')
      .where('keyword.id = :keywordId', { keywordId: keyword.id })
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return [posts, totalElements];
  }

  async findByCategory(
    categoryUrl: string,
    filter: FilterPaginationDto,
  ): Promise<[Posts[], number]> {
    try {
      const page = filter.page || 1;
      const pageSize = filter.pageSize || 20;
      const skip = (page - 1) * pageSize;
  
      // Tìm category theo categoryUrl
      const category = await this.categoryPostRepository.findOne({
        where: { url: categoryUrl },
      });
  
      if (!category) {
        throw new Error(
          `Category with URL ${categoryUrl} not found`,
        );
      }
  
      // Tìm các bài viết liên quan đến category
      const [posts, totalElements] = await this.postRepository
        .createQueryBuilder('posts')
        .leftJoinAndSelect('posts.categories', 'categories')
        .where('categories.id = :categoryId', { categoryId: category.id })
        .skip(skip)
        .take(pageSize)
        .getManyAndCount();
  
      return [posts, totalElements];
    } catch (error) {
      throw new Error(`Failed to find posts by category: ${error.message}`);
    }
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Posts> {
    const {
      categories: categoryIds,
      keywords: keywordIds,
      ...updateData
    } = updatePostDto;

    const post = await this.findOne(id);

    if (categoryIds && categoryIds.length > 0) {
      const categories =
        await this.categoryPostRepository.findByIds(categoryIds);
      post.categories = categories;
    }

    if (keywordIds && keywordIds.length > 0) {
      const keywords = await this.keywordPostRepository.findByIds(keywordIds);
      post.keywords = keywords;
    }

    Object.assign(post, updateData);

    await this.postRepository.save(post);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.postRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Product with ID ${id} not found`);
    }
  }
}
