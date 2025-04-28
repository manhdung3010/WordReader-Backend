import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, MoreThan, Repository } from 'typeorm';
import { Categories } from '../categories/entities/category.entity';
import { InfoProduct } from './entities/info-product.entity';
import { FilterProductDto } from './dto/filter-product.dto';
import { CreateProductFlashSaleDto } from './dto/create-product-flash-sale.dto';
import { Keyword } from '../keywords/entities/keyword.entity';
import { productWarehouse } from './entities/product-warehouse.entity';
import { UpdateProductWarehouse } from './dto/update-product-warehouse.dto';
import { FilterPaginationDto } from './dto/filter-pagination';
import { ReviewsProduct } from '../reviews-product/entities/reviews-product.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Categories)
    private readonly categoriesRepository: Repository<Categories>,

    @InjectRepository(InfoProduct)
    private readonly infoProductRepository: Repository<InfoProduct>,

    @InjectRepository(Keyword)
    private readonly keywordRepository: Repository<Keyword>,

    @InjectRepository(productWarehouse)
    private readonly productWarehouseRepository: Repository<productWarehouse>,

    @InjectRepository(ReviewsProduct)
    private readonly reviewsProductRepository: Repository<ReviewsProduct>,

    private readonly aiService: AiService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const {
      name,
      code,
      description,
      url,
      display,
      status,
      avatar,
      chosenByExperts,
      price,
      perDiscount,
      image,
      information,
      categories: categoryIds,
      flashSale,
      keywords, // Include keywords array
      seo,
      productWarehouse,
    } = createProductDto;

    // Check if product with the same name exists
    const existingProductByName = await this.productRepository.findOne({
      where: { name },
    });

    if (existingProductByName) {
      throw new Error(`Product with name ${name} already exists`);
    }

    // Check if product with the same URL exists
    const existingProductByUrl = await this.productRepository.findOne({
      where: { url },
    });
    if (existingProductByUrl) {
      throw new Error(`Product with URL ${url} already exists`);
    }

    if (perDiscount < 0 || perDiscount > 100) {
      throw new Error('Discount must be between 0 and 100');
    }

    let discountPrice = 0;

    if (perDiscount && perDiscount > 0) {
      discountPrice = (price * perDiscount) / 100;
    }

    let flashSalePrice = price;

    if (flashSale && flashSale.flashSaleDiscount > 0) {
      flashSalePrice = price - (price * flashSale.flashSaleDiscount) / 100;
    }

    const newProduct = this.productRepository.create({
      name,
      code,
      description,
      url,
      display,
      status,
      avatar,
      chosenByExperts,
      price,
      discountPrice,
      perDiscount,
      image,
      flashSale: flashSale
        ? {
            ...flashSale,
            flashSalePrice,
          }
        : undefined,
      seo,
    });

    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoriesRepository.findByIds(categoryIds);
      newProduct.categories = categories;
    }

    // If keywords are provided, fetch corresponding keywords and associate them
    if (keywords && keywords.length > 0) {
      const fetchedKeywords = await this.keywordRepository.findByIds(keywords);
      newProduct.keywords = fetchedKeywords;
    }

    // Save the new product entity to the database
    await this.productRepository.save(newProduct);

    // Create productWarehouse instance and associate with newProduct
    if (productWarehouse) {
      const { quantityInStock, quantityInUse } = productWarehouse;
      const displayQuantity = quantityInStock - quantityInUse;

      const newProductWarehouse = this.productWarehouseRepository.create({
        product: newProduct,
        quantityInStock,
        quantityInUse,
        displayQuantity,
      });

      await this.productWarehouseRepository.save(newProductWarehouse);
    }

    // Create InfoProduct instances and associate with newProduct
    if (information && information.length > 0) {
      for (const infoProductDto of information) {
        const { name: infoName, content } = infoProductDto;
        const infoProduct = this.infoProductRepository.create({
          name: infoName,
          content,
          product: newProduct,
        });
        await this.infoProductRepository.save(infoProduct);
      }
    }

    // Update AI recommendations with the new product
    await this.aiService.updateRecomendations({
      id: newProduct.id,
      name: newProduct.name,
      description: newProduct.description,
    });

    return newProduct;
  }

  async createFlashSale(
    id: number,
    createProductFlashSaleDto: CreateProductFlashSaleDto,
  ): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }

      let flashSalePrice = 0;

      if (
        createProductFlashSaleDto.flashSale &&
        createProductFlashSaleDto.flashSale.flashSaleDiscount > 0
      ) {
        flashSalePrice =
          product.price -
          (product.price *
            createProductFlashSaleDto.flashSale.flashSaleDiscount) /
            100;
      }

      const updateObject = {
        flashSale: {
          ...createProductFlashSaleDto.flashSale,
          flashSalePrice,
        },
      };

      await this.productRepository.update(id, updateObject);

      const updatedProduct = await this.findOne(id);
      return updatedProduct;
    } catch (error) {
      throw new Error(
        `Failed to update product with ID ${id}: ${error.message}`,
      );
    }
  }

  async updateProductWarehouse(
    id: number,
    updateProductWarehouseDto: UpdateProductWarehouse,
  ): Promise<Product> {
    try {
      const { productWarehouse } = updateProductWarehouseDto;

      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['productWarehouse'],
      });

      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }

      if (productWarehouse) {
        const { quantityInStock, quantityInUse } = productWarehouse;

        // Update existing product warehouse or create a new one if not present
        if (product.productWarehouse) {
          product.productWarehouse.quantityInStock = quantityInStock;
          product.productWarehouse.quantityInUse = quantityInUse;
          product.productWarehouse.displayQuantity =
            quantityInStock - quantityInUse;

          await this.productWarehouseRepository.save(product.productWarehouse);
        } else {
          const newProductWarehouse = this.productWarehouseRepository.create({
            product: product,
            quantityInStock,
            quantityInUse,
            displayQuantity: quantityInStock - quantityInUse,
          });

          await this.productWarehouseRepository.save(newProductWarehouse);

          product.productWarehouse = newProductWarehouse;
        }

        await this.productRepository.save(product);
      }

      // Return the updated product
      return product;
    } catch (error) {
      throw new Error(
        `Failed to update product with ID ${id}: ${error.message}`,
      );
    }
  }

  async deleteFlashSale(id: number): Promise<Product> {
    try {
      const updateObject = {
        flashSale: null,
      };
      await this.productRepository.update(id, updateObject);
      const updatedProduct = await this.findOne(id);
      return updatedProduct;
    } catch (error) {
      throw new Error(
        `Failed to update product with ID ${id}: ${error.message}`,
      );
    }
  }

  async findAll(filter: FilterProductDto): Promise<[Product[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const whereClause = this.buildWhereClause(filter);

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.information', 'information')
      .leftJoinAndSelect('product.keywords', 'keywords')
      .leftJoinAndSelect('product.productWarehouse', 'productWarehouse');

    // Áp dụng whereClause đã được build sẵn
    Object.entries(whereClause).forEach(([key, value]) => {
      qb.andWhere(`product.${key} = :${key}`, { [key]: value });
    });

    if (filter.name) {
      qb.andWhere('LOWER(product.name) LIKE LOWER(:name)', {
        name: `%${filter.name}%`,
      });
    }

    if (filter.priceMin !== undefined) {
      qb.andWhere('product.price >= :priceMin', { priceMin: filter.priceMin });
    }
    if (filter.priceMax !== undefined) {
      qb.andWhere('product.price <= :priceMax', { priceMax: filter.priceMax });
    }

    // Filter categories nếu có
    if (filter.categories && filter.categories.length > 0) {
      qb.andWhere('category.id IN (:...categoryIds)', {
        categoryIds: filter.categories,
      });
    }

    qb.skip(skip).take(pageSize);

    const [products, totalElements] = await qb.getManyAndCount();

    for (const product of products) {
      const avgRating = await this.calculateAverageRating(product.id);
      product.averageStarRating = avgRating;
    }

    return [products, totalElements];
  }

  async findByIds(ids: number[]): Promise<Product[]> {
    try {
      const products = await this.productRepository.find({
        where: { id: In(ids) },
        relations: [
          'categories',
          'information',
          'keywords',
          'productWarehouse',
        ],
      });
      return products;
    } catch (error) {
      throw new Error(`Failed to fetch products by IDs: ${error.message}`);
    }
  }

  private buildWhereClause(filter: Partial<FilterProductDto>): any {
    const where: any = {};

    if (filter.code) {
      where.code = filter.code;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    // Convert display string value to boolean
    if (typeof filter.display === 'boolean') {
      where.display = filter.display;
    } else if (typeof filter.display === 'string') {
      where.display = filter.display === 'true';
    }

    if (typeof filter.isDiscount === 'string') {
      filter.isDiscount = filter.isDiscount === 'true';
    }

    if (filter.isDiscount === true) {
      where.perDiscount = MoreThan(0);
    }

    return where;
  }

  private async calculateAverageRating(productId: number): Promise<number> {
    const avgRating = await this.reviewsProductRepository
      .createQueryBuilder('rp')
      .select('AVG(rp.star)', 'averageStarRating')
      .where('rp.product.id = :productId', { productId })
      .getRawOne();

    // Lấy giá trị trung bình đánh giá và làm tròn đến 2 chữ số thập phân
    const roundedAvgRating = avgRating.averageStarRating || 0;
    return Math.round(roundedAvgRating * 100) / 100;
  }

  async findAllFlashSale(): Promise<Product[]> {
    const currentTime = new Date();
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.information', 'information')
      .where('product.flashSale->>"$.flashSaleStartTime" <= :currentTime', {
        currentTime,
      })
      .andWhere('product.flashSale->>"$.flashSaleEndTime" >= :currentTime', {
        currentTime,
      })
      .getMany();

    return products;
  }

  async findByKeyword(
    keywordCode: string,
    filter: FilterPaginationDto,
  ): Promise<[Product[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const keyword = await this.keywordRepository.findOne({
      where: { code: keywordCode },
    });

    if (!keyword) {
      throw new Error(`Keyword with code ${keywordCode} not found`);
    }

    const [products, totalElements] = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.keywords', 'keyword')
      .where('keyword.id = :keywordId', { keywordId: keyword.id })
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return [products, totalElements];
  }

  async findByCategory(
    categoryUrl: string,
    filter: FilterProductDto,
  ): Promise<[Product[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const category = await this.categoriesRepository.findOne({
      where: { url: categoryUrl },
    });

    if (!category) {
      throw new Error(`Category with URL ${categoryUrl} not found`);
    }

    const whereClause = this.buildWhereClause(filter);

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.information', 'information')
      .leftJoinAndSelect('product.keywords', 'keywords')
      .leftJoinAndSelect('product.productWarehouse', 'productWarehouse')
      .where('categories.id = :categoryId', { categoryId: category.id });

    // Áp dụng filter thêm từ whereClause
    Object.entries(whereClause).forEach(([key, value]) => {
      qb.andWhere(`product.${key} = :${key}`, { [key]: value });
    });

    // Filter theo tên
    if (filter.name) {
      qb.andWhere('LOWER(product.name) LIKE LOWER(:name)', {
        name: `%${filter.name}%`,
      });
    }

    if (filter.priceMin !== undefined) {
      qb.andWhere('product.price >= :priceMin', { priceMin: filter.priceMin });
    }
    if (filter.priceMax !== undefined) {
      qb.andWhere('product.price <= :priceMax', { priceMax: filter.priceMax });
    }

    // Filter thêm theo category phụ nếu có
    if (filter.categories && filter.categories.length > 0) {
      qb.andWhere('categories.id IN (:...categoryIds)', {
        categoryIds: filter.categories,
      });
    }

    qb.skip(skip).take(pageSize);

    const [products, totalElements] = await qb.getManyAndCount();

    // Tính average rating song song
    const ratings = await Promise.all(
      products.map((p) => this.calculateAverageRating(p.id)),
    );
    products.forEach((product, i) => {
      product.averageStarRating = ratings[i];
    });

    return [products, totalElements];
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['categories', 'information', 'keywords', 'productWarehouse'],
    });
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findOneByUrl(url: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { url },
      relations: ['categories', 'information', 'keywords', 'productWarehouse'],
    });

    if (!product) {
      throw new Error(`Product with url ${url} not found`);
    }

    const avgRating = await this.calculateAverageRating(product.id);
    product.averageStarRating = avgRating;

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      const {
        categories: categoryIds,
        keywords: keywordIds,
        productWarehouse,
        information,
        ...updateData
      } = updateProductDto;

      const product = await this.findOne(id);
      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }

      // Check if URL is being updated and if it already exists
      if (updateData.url && updateData.url !== product.url) {
        const existingProductByUrl = await this.productRepository.findOne({
          where: { url: updateData.url },
        });
        if (existingProductByUrl && existingProductByUrl.id !== id) {
          throw new Error(`Product with URL ${updateData.url} already exists`);
        }
      }

      // If categoryIds are provided, fetch corresponding categories and associate them
      if (categoryIds && categoryIds.length > 0) {
        const categories = await this.categoriesRepository.findBy({
          id: In(categoryIds),
        });
        product.categories = categories;
      }

      // If keywordIds are provided, fetch corresponding keywords and associate them
      if (keywordIds && keywordIds.length > 0) {
        const keywords = await this.keywordRepository.findBy({
          id: In(keywordIds),
        });
        product.keywords = keywords;
      }

      // Update product fields
      Object.assign(product, updateData);

      await this.productRepository.save(product);

      // Update productWarehouse
      if (productWarehouse) {
        const existingWarehouse = await this.productWarehouseRepository.findOne(
          {
            where: { product: { id: product.id } },
          },
        );

        if (existingWarehouse) {
          const { quantityInStock, quantityInUse } = productWarehouse;
          existingWarehouse.quantityInStock = quantityInStock;
          existingWarehouse.quantityInUse = quantityInUse;
          existingWarehouse.displayQuantity = quantityInStock - quantityInUse;
          await this.productWarehouseRepository.save(existingWarehouse);
        } else {
          const { quantityInStock, quantityInUse } = productWarehouse;
          const displayQuantity = quantityInStock - quantityInUse;

          const newProductWarehouse = this.productWarehouseRepository.create({
            product,
            quantityInStock,
            quantityInUse,
            displayQuantity,
          });

          await this.productWarehouseRepository.save(newProductWarehouse);
        }
      }

      // Update information
      if (information && information.length > 0) {
        await this.infoProductRepository.delete({
          product: { id: product.id },
        });

        for (const infoProductDto of information) {
          const { name: infoName, content } = infoProductDto;
          const infoProduct = this.infoProductRepository.create({
            name: infoName,
            content,
            product,
          });
          await this.infoProductRepository.save(infoProduct);
        }
      }

      try {
        await this.aiService.updateProduct(id, {
          id: product.id,
          name: product.name,
          description: product.description,
        });
      } catch (aiError) {
        console.error('Failed to update AI recommendations:', aiError.message);
        // Continue with the update even if AI service fails
      }

      return this.findOne(id);
    } catch (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const product = await this.findOne(id);
      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }

      await this.aiService.deleteProduct(id);

      await this.productRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  async findRandomChosenByExperts(size: number): Promise<Product[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.information', 'information')
      .leftJoinAndSelect('product.keywords', 'keywords')
      .leftJoinAndSelect('product.productWarehouse', 'productWarehouse')
      .where('product.chosenByExperts = :chosen', { chosen: true })
      .orderBy('RAND()') // Changed from RANDOM() to RAND() for MySQL
      .take(size)
      .getMany();

    // Calculate average rating for each product
    for (const product of products) {
      const avgRating = await this.calculateAverageRating(product.id);
      product.averageStarRating = avgRating;
    }

    return products;
  }
}
