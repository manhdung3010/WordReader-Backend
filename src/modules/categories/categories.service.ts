import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Categories } from './entities/category.entity';
import { FilterCategoryDto } from './dto/filter-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private readonly categoriesRepository: Repository<Categories>,
  ) {}

  async findAll(filter: FilterCategoryDto): Promise<[Categories[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const whereClause = this.buildWhereClause(filter);

    const options: FindManyOptions<Categories> = {
      relations: ['parents', 'children'],
      where: whereClause,
      skip: skip,
      take: pageSize,
    };

    const [categories, totalElements] =
      await this.categoriesRepository.findAndCount(options);

    return [categories, totalElements];
  }

  private buildWhereClause(filter: Partial<FilterCategoryDto>): any {
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

  async findOne(id: number): Promise<Categories> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['parents', 'children'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Categories> {
    const {
      name,
      description,
      url,
      display,
      homeDisplay,
      image,
      parentIds,
      seo,
    } = createCategoryDto;

    // Kiểm tra trùng lặp name
    const existingCategoryByName = await this.categoriesRepository.findOne({
      where: { name },
    });
    if (existingCategoryByName) {
      throw new ConflictException(`Category with name ${name} already exists`);
    }

    // Kiểm tra trùng lặp url
    const existingCategoryByUrl = await this.categoriesRepository.findOne({
      where: { url },
    });
    if (existingCategoryByUrl) {
      throw new ConflictException(`Category with url ${url} already exists`);
    }

    let parentCategories: Categories[] = [];

    if (parentIds && parentIds.length > 0) {
      parentCategories = await this.categoriesRepository.findByIds(parentIds);
    }

    const newCategory = new Categories();
    newCategory.name = name;
    newCategory.description = description;
    newCategory.url = url;
    newCategory.display = display;
    newCategory.homeDisplay = homeDisplay;
    newCategory.image = image;
    newCategory.parents = parentCategories;
    newCategory.seo = seo;

    return this.categoriesRepository.save(newCategory);
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Categories> {
    const category = await this.findOne(id);

    if (updateCategoryDto.name) {
      category.name = updateCategoryDto.name;
    }

    if (updateCategoryDto.parentIds) {
      let parentCategories: Categories[] = [];

      if (updateCategoryDto.parentIds.length > 0) {
        parentCategories = await this.categoriesRepository.findByIds(
          updateCategoryDto.parentIds,
        );
      }

      category.parents = parentCategories;
    }

    if (updateCategoryDto.seo) {
      category.seo = updateCategoryDto.seo;
    }

    return this.categoriesRepository.save(category);
  }

  async remove(id: number): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
    return { message: `Category with ID ${id} has been successfully removed` };
  }
}
