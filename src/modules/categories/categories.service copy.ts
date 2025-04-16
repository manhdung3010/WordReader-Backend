import { Injectable } from '@nestjs/common';
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

  async findAll(filter: FilterCategoryDto): Promise<Categories[]> {
    const whereClause = this.buildWhereClause(filter);

    const options: FindManyOptions<Categories> = {
      relations: ['parents', 'children'],
      where: whereClause,
    };

    const categories = await this.categoriesRepository.find(options);

    // Tạo một tập hợp để lưu tất cả id của danh mục con
    const childrenIds = new Set<number>();

    // Duyệt qua tất cả danh mục để lấy id của `children`
    categories.forEach((category) => {
      if (category.children) {
        category.children.forEach((child) => childrenIds.add(child.id));
      }
    });

    // Loại bỏ các danh mục đã xuất hiện trong `children`
    const filteredCategories = categories.filter(
      (category) => !childrenIds.has(category.id),
    );

    return filteredCategories;
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
      throw new Error(`Category with ID ${id} not found`);
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
      throw new Error(`Category with name ${name} already exists`);
    }

    // Kiểm tra trùng lặp url
    const existingCategoryByUrl = await this.categoriesRepository.findOne({
      where: { url },
    });
    if (existingCategoryByUrl) {
      throw new Error(`Category with url ${url} already exists`);
    }

    let parentCategories: Categories[] = [];

    if (parentIds && parentIds.length > 0) {
      parentCategories = await this.categoriesRepository.findByIds(parentIds);
    }

    // Tạo danh mục mới trước khi kiểm tra
    const newCategory = new Categories();
    newCategory.name = name;
    newCategory.description = description;
    newCategory.url = url;
    newCategory.display = display;
    newCategory.homeDisplay = homeDisplay;
    newCategory.image = image;
    newCategory.parents = parentCategories;
    newCategory.seo = seo;

    // Lưu vào database trước để có id
    const savedCategory = await this.categoriesRepository.save(newCategory);

    // Kiểm tra vòng lặp phân cấp
    for (const parent of parentCategories) {
      if (parent.id === savedCategory.id) {
        throw new Error(`Category cannot be a parent of itself.`);
      }

      // Kiểm tra xem danh mục mới có nằm trong cây con của cha không
      if (await this.isDescendant(parent.id, savedCategory.id)) {
        throw new Error(`Category cannot be a descendant of itself.`);
      }
    }

    return savedCategory;
  }

  /**
   * Kiểm tra xem categoryId có phải là con (hoặc con của con) của parentId không
   */
  private async isDescendant(
    parentId: number,
    categoryId: number,
  ): Promise<boolean> {
    const parentCategory = await this.categoriesRepository.findOne({
      where: { id: parentId },
      relations: ['children'],
    });

    if (!parentCategory || !parentCategory.children) return false;

    for (const child of parentCategory.children) {
      if (
        child.id === categoryId ||
        (await this.isDescendant(child.id, categoryId))
      ) {
        return true;
      }
    }

    return false;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Categories> {
    const category = await this.findOne(id);

    // Áp dụng các cập nhật khác
    Object.assign(category, updateCategoryDto);

    if (updateCategoryDto.parentIds) {
      let parentCategories: Categories[] = [];

      if (updateCategoryDto.parentIds.length > 0) {
        parentCategories = await this.categoriesRepository.findByIds(
          updateCategoryDto.parentIds,
        );
      }

      // Kiểm tra xem danh mục có tự làm cha của chính nó không
      for (const parent of parentCategories) {
        if (parent.id === id) {
          throw new Error(`Category cannot be a parent of itself.`);
        }

        // Kiểm tra vòng lặp phân cấp (danh mục không thể là con của con nó)
        if (await this.isDescendant(parent.id, id)) {
          throw new Error(`Category cannot be a descendant of itself.`);
        }
      }

      category.parents = parentCategories;
    }

    return this.categoriesRepository.save(category);
  }

  async remove(id: number): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
    return { message: `Category with ID ${id} has been successfully removed` };
  }
}
