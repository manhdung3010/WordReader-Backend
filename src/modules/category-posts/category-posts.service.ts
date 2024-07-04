import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryPostDto } from './dto/create-category-post.dto';
import { UpdateCategoryPostDto } from './dto/update-category-post.dto';
import { CategoryPost } from './entities/category-post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { FilterCategoryPostsDto } from './dto/filter-category-posts.dto';

@Injectable()
export class CategoryPostsService {
  constructor(
    @InjectRepository(CategoryPost)
    private readonly categoryPostRepository: Repository<CategoryPost>,
  ) {}

  async findAll(
    filter: FilterCategoryPostsDto,
  ): Promise<[CategoryPost[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const whereClause = this.buildWhereClause(filter);

    const options: FindManyOptions<CategoryPost> = {
      relations: ['parents', 'children'],
      where: whereClause,
      skip: skip,
      take: pageSize,
    };

    const [categories, totalElements] =
      await this.categoryPostRepository.findAndCount(options);

    return [categories, totalElements];
  }

  private buildWhereClause(filter: Partial<FilterCategoryPostsDto>): any {
    const where: any = {};

    if (filter.name) {
      where.name = filter.name;
    }

    if (filter.url) {
      where.url = filter.url;
    }

    // Chuyển đổi giá trị của display thành boolean nếu có
    if (typeof filter.display === 'boolean') {
      where.display = filter.display;
    } else if (typeof filter.display === 'string') {
      where.display = filter.display === 'true';
    }

    // Chuyển đổi giá trị của homeDisplay thành boolean nếu có
    if (typeof filter.homeDisplay === 'boolean') {
      where.homeDisplay = filter.homeDisplay;
    } else if (typeof filter.homeDisplay === 'string') {
      where.homeDisplay = filter.homeDisplay === 'true';
    }

    return where;
  }

  async findOne(id: number): Promise<CategoryPost> {
    const category = await this.categoryPostRepository.findOne({
      where: { id },
      relations: ['parents', 'children'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(createCategoryPostDto: CreateCategoryPostDto): Promise<CategoryPost> {
    const {
      name,
      description,
      url,
      display,
      homeDisplay,
      image,
      parentIds,
      seo,
    } = createCategoryPostDto;

    // Kiểm tra trùng lặp name
    const existingCategoryByName = await this.categoryPostRepository.findOne({
      where: { name },
    });
    if (existingCategoryByName) {
      throw new ConflictException(`Category with name ${name} already exists`);
    }

    // Kiểm tra trùng lặp url
    const existingCategoryByUrl = await this.categoryPostRepository.findOne({
      where: { url },
    });
    if (existingCategoryByUrl) {
      throw new ConflictException(`Category with url ${url} already exists`);
    }

    let parentCategories: CategoryPost[] = [];

    if (parentIds && parentIds.length > 0) {
      parentCategories = await this.categoryPostRepository.findByIds(parentIds);
    }

    const newCategory = new CategoryPost();
    newCategory.name = name;
    newCategory.description = description;
    newCategory.url = url;
    newCategory.display = display;
    newCategory.homeDisplay = homeDisplay;
    newCategory.image = image;
    newCategory.parents = parentCategories;
    newCategory.seo = seo;

    return this.categoryPostRepository.save(newCategory);
  }



  async update(
    id: number,
    updateCategoryPostDto: UpdateCategoryPostDto,
  ): Promise<CategoryPost> {
    const category = await this.findOne(id);

    if (updateCategoryPostDto.name) {
      category.name = updateCategoryPostDto.name;
    }

    if (updateCategoryPostDto.parentIds) {
      let parentCategories: CategoryPost[] = [];

      if (updateCategoryPostDto.parentIds.length > 0) {
        parentCategories = await this.categoryPostRepository.findByIds(
          updateCategoryPostDto.parentIds,
        );
      }

      category.parents = parentCategories;
    }

    if (updateCategoryPostDto.seo) {
      category.seo = updateCategoryPostDto.seo;
    }

    return this.categoryPostRepository.save(category);
  }

  async remove(id: number): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.categoryPostRepository.remove(category);
    return { message: `Category with ID ${id} has been successfully removed` };
  }
}
