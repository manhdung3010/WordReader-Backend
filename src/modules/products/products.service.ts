import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import {
  FindManyOptions,
  In,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Categories } from '../categories/entities/category.entity';
import { InfoProduct } from './entities/info-product.entity';
import { FilterProductDto } from './dto/filter-product.dto';
import { CreateProductFlashSaleDto } from './dto/create-product-flash-sale.dto';
import { Keyword } from '../keywords/entities/keyword.entity';
import { productWarehouse } from './entities/product-warehouse.entity';
import { UpdateProductWarehouse } from './dto/update-product-warehouse.dto';
import { FilterPaginationDto } from './dto/filter-pagination';
import { ReviewsProduct } from '../reviews-product/entities/reviews-product.entity';

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

    return newProduct;
  }

  async createFlashSale(
    id: number,
    createProductFlashSaleDto: CreateProductFlashSaleDto,
  ): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
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
        throw new NotFoundException(`Product with ID ${id} not found`);
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

    const options: FindManyOptions<Product> = {
      relations: ['categories', 'information', 'keywords', 'productWarehouse'],
      where: whereClause,
      skip: skip,
      take: pageSize,
    };

    try {
      const [products, totalElements] =
        await this.productRepository.findAndCount(options);

      for (const product of products) {
        const avgRating = await this.calculateAverageRating(product.id);
        product.averageStarRating = avgRating;
      }

      return [products, totalElements];
    } catch (error) {
      // Handle error appropriately
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
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

    if (filter.name) {
      where.name = filter.name;
    }

    if (filter.code) {
      where.code = filter.code;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.priceMin !== undefined) {
      where.price = MoreThanOrEqual(filter.priceMin);
    }

    if (filter.priceMax !== undefined) {
      where.price = LessThanOrEqual(filter.priceMax);
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
      where.discount = MoreThan(0);
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
      throw new NotFoundException(`Keyword with code ${keywordCode} not found`);
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
    filter: FilterPaginationDto,
  ): Promise<[Product[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const category = await this.categoriesRepository.findOne({
      where: { url: categoryUrl },
    });

    if (!category) {
      throw new NotFoundException(`Category with URL ${categoryUrl} not found`);
    }

    const [products, totalElements] = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .where('categories.id = :categoryId', { categoryId: category.id })
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return [products, totalElements];
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['categories', 'information', 'keywords', 'productWarehouse'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const {
      categories: categoryIds,
      keywords: keywordIds,
      productWarehouse,
      information,
      ...updateData
    } = updateProductDto;

    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // If categoryIds are provided, fetch corresponding categories and associate them
    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoriesRepository.findByIds(categoryIds);
      product.categories = categories;
    }

    // If keywordIds are provided, fetch corresponding keywords and associate them
    if (keywordIds && keywordIds.length > 0) {
      const keywords = await this.keywordRepository.findByIds(keywordIds);
      product.keywords = keywords;
    }

    // Update product fields
    Object.assign(product, updateData);

    await this.productRepository.save(product);

    // Update productWarehouse
    if (productWarehouse) {
      const existingWarehouse = await this.productWarehouseRepository.findOne({
        where: { product: { id: product.id } },
      });

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
      await this.infoProductRepository.delete({ product: { id: product.id } });

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

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
