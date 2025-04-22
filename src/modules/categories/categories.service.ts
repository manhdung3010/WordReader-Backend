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

    // Áp dụng các cập nhật khác (trừ phần parents)
    const { parentIds, ...otherUpdates } = updateCategoryDto;
    Object.assign(category, otherUpdates);

    // Xử lý quan hệ parents nếu được cung cấp
    if (parentIds !== undefined) {
      // Khởi tạo mảng parents rỗng
      let parentCategories: Categories[] = [];

      // Chỉ tìm kiếm khi có parentIds được cung cấp
      if (parentIds && parentIds.length > 0) {
        parentCategories = await this.categoriesRepository.findByIds(parentIds);

        // Kiểm tra nếu không tìm thấy đủ số lượng parents
        if (parentCategories.length !== parentIds.length) {
          throw new Error('One or more parent categories not found');
        }

        // Kiểm tra các ràng buộc về cấu trúc phân cấp
        for (const parent of parentCategories) {
          // Kiểm tra xem danh mục có tự làm cha của chính nó không
          if (parent.id === id) {
            throw new Error('Category cannot be a parent of itself');
          }

          // Kiểm tra vòng lặp phân cấp chỉ khi parent ID thực sự thay đổi
          // So sánh với danh sách parents hiện tại để tránh kiểm tra không cần thiết
          const isExistingParent = category.parents?.some(
            (existingParent) => existingParent.id === parent.id,
          );
          if (!isExistingParent && (await this.isDescendant(parent.id, id))) {
            throw new Error(
              'Circular hierarchy detected: category cannot be a descendant of itself',
            );
          }
        }
      }

      // Gán danh sách parents mới cho category
      category.parents = parentCategories;
    }

    // Lưu và trả về category đã cập nhật
    return this.categoriesRepository.save(category);
  }
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

  async remove(id: number): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
    return { message: `Category with ID ${id} has been successfully removed` };
  }

  async findAllRelation(filter: FilterCategoryDto): Promise<Categories[]> {
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
}
