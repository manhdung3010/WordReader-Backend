import { CheckDiscountDto } from './dto/check-discount.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Repository } from 'typeorm';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { Discount } from './entities/discount.entity';
import { FilterDiscountDto } from './dto/filter-discount.dto';
import { Categories } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { DiscountType } from 'src/common/enums/discount.enum';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,

    @InjectRepository(Categories)
    private readonly categoriesRepository: Repository<Categories>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createDiscountDto: CreateDiscountDto): Promise<Discount> {
    const existingDiscountByName = await this.discountRepository.findOne({
      where: { name: createDiscountDto.name },
    });
    if (existingDiscountByName) {
      throw new ConflictException(
        `Discount with name ${createDiscountDto.name} already exists`,
      );
    }

    const existingDiscountByCode = await this.discountRepository.findOne({
      where: { code: createDiscountDto.code },
    });
    if (existingDiscountByCode) {
      throw new ConflictException(
        `Discount with code ${createDiscountDto.code} already exists`,
      );
    }

    // Remove categoryDiscount from DTO
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { categoryDiscount, ...discountData } = createDiscountDto;

    // Create discount without categoryDiscount
    const newDiscount = this.discountRepository.create(discountData);

    if (
      createDiscountDto.categoryDiscount &&
      createDiscountDto.categoryDiscount.length > 0
    ) {
      const categories = await this.categoriesRepository.findByIds(
        createDiscountDto.categoryDiscount,
      );
      newDiscount.categoryDiscount = categories;
    }

    try {
      return await this.discountRepository.save(newDiscount);
    } catch (error) {
      throw new Error(`Failed to create discount: ${error.message}`);
    }
  }

  async findAll(filter: FilterDiscountDto): Promise<[Discount[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const options: FindManyOptions<Discount> = {
      relations: ['categoryDiscount'],
      skip: skip,
      take: pageSize,
      where: this.buildWhereClause(filter),
    };

    try {
      const [discounts, totalElements] =
        await this.discountRepository.findAndCount(options);

      let filteredDiscounts = discounts;

      if (filter.categoryDiscount && filter.categoryDiscount.length > 0) {
        if (filter.categoryDiscount.length === 1) {
          filter.categoryDiscount = [...filter.categoryDiscount];
        }
        filteredDiscounts = discounts.filter((discount) => {
          const discountCategoryIds = discount.categoryDiscount.map(
            (category) => category.id,
          );

          return filter.categoryDiscount.every((categoryId) =>
            discountCategoryIds.includes(+categoryId),
          );
        });
      }

      return [filteredDiscounts, totalElements];
    } catch (error) {
      throw new Error(`Failed to retrieve discounts: ${error.message}`);
    }
  }

  private buildWhereClause(filter: Partial<FilterDiscountDto>): any {
    const where: any = {};

    if (filter.name) {
      where.name = filter.name;
    }

    if (filter.code) {
      where.code = filter.code;
    }

    if (filter.discountType) {
      where.discountType = filter.discountType;
    }

    if (typeof filter.display === 'boolean') {
      where.display = filter.display;
    } else if (typeof filter.display === 'string') {
      where.display = filter.display === 'true';
    }

    if (typeof filter.active === 'boolean') {
      where.active = filter.active;
    } else if (typeof filter.active === 'string') {
      where.active = filter.active === 'true';
    }

    if (filter.price !== undefined) {
      where.price = filter.price;
    }

    if (filter.usageLimit !== undefined) {
      where.usageLimit = filter.usageLimit;
    }

    if (filter.maxDiscount !== undefined) {
      where.maxDiscount = filter.maxDiscount;
    }

    if (filter.minPurchase !== undefined) {
      where.minPurchase = filter.minPurchase;
    }

    if (filter.startTime !== undefined) {
      where.startTime = filter.startTime;
    }

    if (filter.endTime !== undefined) {
      where.endTime = filter.endTime;
    }

    if (typeof filter.isFullDiscount === 'boolean') {
      where.isFullDiscount = filter.isFullDiscount;
    } else if (typeof filter.isFullDiscount === 'string') {
      where.isFullDiscount = filter.isFullDiscount === 'true';
    }

    return where;
  }

  async findOne(id: number): Promise<Discount> {
    try {
      const discount = await this.discountRepository.findOne({
        where: { id },
        relations: ['categoryDiscount'],
      });
      if (!discount) {
        throw new NotFoundException(`discount with id ${id} not found`);
      }
      return discount;
    } catch (error) {
      throw new Error(
        `Failed to find discount with id ${id}: ${error.message}`,
      );
    }
  }

  async findByCode(code: string): Promise<Discount> {
    try {
      const discount = await this.discountRepository.findOne({
        where: { code },
        relations: ['categoryDiscount'],
      });
      if (!discount) {
        throw new NotFoundException(`discount with id ${code} not found`);
      }

      const currentDateTime = new Date();
      if (
        currentDateTime < discount.startTime ||
        currentDateTime > discount.endTime
      ) {
        throw new BadRequestException(
          `Discount with code "${code}" is not currently active`,
        );
      }

      return discount;
    } catch (error) {
      throw new Error(
        `Failed to find discount with code ${code}: ${error.message}`,
      );
    }
  }

  async update(
    id: number,
    updateDiscountDto: UpdateDiscountDto,
  ): Promise<Discount> {
    const existingDiscount = await this.findOne(id);
    if (!existingDiscount) {
      throw new NotFoundException(`Discount with id ${id} not found`);
    }

    // Remove categoryDiscount from DTO
    const { categoryDiscount, ...discountData } = updateDiscountDto;

    try {
      // Update discount without categoryDiscount
      await this.discountRepository.update(id, discountData);

      // Update categoryDiscount if provided
      if (categoryDiscount && categoryDiscount.length > 0) {
        const categories =
          await this.categoriesRepository.findByIds(categoryDiscount);
        existingDiscount.categoryDiscount = categories;
      }

      // Save the updated discount
      return await this.discountRepository.save(existingDiscount);
    } catch (error) {
      throw new Error(
        `Failed to update discount with id ${id}: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    const discount = await this.findOne(id);
    await this.discountRepository.remove(discount);
  }

  async checkDiscount(checkDiscountDto: CheckDiscountDto): Promise<any> {
    const { code, products: productsDto } = checkDiscountDto;
  
    // Find the discount based on the code
    const discount = await this.discountRepository.findOne({
      where: { code },
      relations: ['categoryDiscount'],
    });
  
    // Check if the discount exists
    if (!discount) {
      throw new NotFoundException(`Discount with code "${code}" not found`);
    }
  
    const currentDateTime = new Date();
  
    // Check if the discount is currently active
    if (currentDateTime < discount.startTime || currentDateTime > discount.endTime) {
      throw new NotFoundException(`Discount with code "${code}" is not currently active`);
    }
  
    // Check if the discount usage limit is reached
    if (discount.usageLimit <= 0) {
      throw new NotFoundException(`Discount with code "${code}" has reached its usage limit`);
    }
  
    const categoryIds = discount.categoryDiscount.map((category) => category.id);
  
    const productIds = productsDto?.map((productDto) => productDto.productId) || [];
    let priceReduce: number = 0;
    let productData: Product[] = [];
  
    // Retrieve product data based on whether it's a full discount or specific categories
    if (discount.isFullDiscount) {
      productData = await this.productRepository.findByIds(productIds);
    } else {
      productData = await this.productRepository.find({
        where: {
          categories: {
            id: In(categoryIds),
          },
          id: In(productIds),
        },
        relations: ['categories'],
      });
    }
  
    // Calculate the total price of the products after individual discounts
    const totalPrice = productData.reduce((sum, product) => {
      const productDto = productsDto.find((dto) => dto.productId === product.id);
      return (
        sum +
        (product.price - product.discountPrice) * (productDto?.quantity || 0)
      );
    }, 0);
  
    // Calculate the discount reduction if total price meets the minimum purchase requirement
    if (totalPrice >= discount.minPurchase) {
      if (discount.discountType === DiscountType.Percentage) {
        const discountAmount = totalPrice * (discount.price / 100);
        priceReduce = Math.min(discountAmount, discount.maxDiscount);
      } else if (discount.discountType === DiscountType.FixedAmount) {
        // Use fixed amount as price reduction and cap it with maxDiscount
        priceReduce = Math.min(discount.price);
      }
    }

  
    return {
      priceReduce: priceReduce,
    };
  }
}
