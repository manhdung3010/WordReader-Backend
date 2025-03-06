import { Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { FilterMenuDto } from './dto/filter-menu.dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async findAll(filter: FilterMenuDto): Promise<[Menu[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const whereClause = this.buildWhereClause(filter);

    const options: FindManyOptions<Menu> = {
      relations: ['parents', 'children'],
      where: whereClause,
      skip: skip,
      take: pageSize,
    };

    const [categories, totalElements] =
      await this.menuRepository.findAndCount(options);

    return [categories, totalElements];
  }

  private buildWhereClause(filter: Partial<FilterMenuDto>): any {
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

  async findOne(id: number): Promise<Menu> {
    const category = await this.menuRepository.findOne({
      where: { id },
      relations: ['parents', 'children'],
    });
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(createCategoryPostDto: CreateMenuDto): Promise<Menu> {
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
    const existingCategoryByName = await this.menuRepository.findOne({
      where: { name },
    });
    if (existingCategoryByName) {
      throw new Error(`Category with name ${name} already exists`);
    }

    // Kiểm tra trùng lặp url
    const existingCategoryByUrl = await this.menuRepository.findOne({
      where: { url },
    });
    if (existingCategoryByUrl) {
      throw new Error(`Category with url ${url} already exists`);
    }

    let parentCategories: Menu[] = [];

    if (parentIds && parentIds.length > 0) {
      parentCategories = await this.menuRepository.findByIds(parentIds);
    }

    const newCategory = new Menu();
    newCategory.name = name;
    newCategory.description = description;
    newCategory.url = url;
    newCategory.display = display;
    newCategory.homeDisplay = homeDisplay;
    newCategory.image = image;
    newCategory.parents = parentCategories;
    newCategory.seo = seo;

    return this.menuRepository.save(newCategory);
  }

  async update(
    id: number,
    updateCategoryPostDto: UpdateMenuDto,
  ): Promise<Menu> {
    const category = await this.findOne(id);

    if (updateCategoryPostDto.name) {
      category.name = updateCategoryPostDto.name;
    }

    if (updateCategoryPostDto.parentIds) {
      let parentCategories: Menu[] = [];

      if (updateCategoryPostDto.parentIds.length > 0) {
        parentCategories = await this.menuRepository.findByIds(
          updateCategoryPostDto.parentIds,
        );
      }

      category.parents = parentCategories;
    }

    if (updateCategoryPostDto.seo) {
      category.seo = updateCategoryPostDto.seo;
    }

    return this.menuRepository.save(category);
  }

  async remove(id: number): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.menuRepository.remove(category);
    return { message: `Menu with ID ${id} has been successfully removed` };
  }
}
