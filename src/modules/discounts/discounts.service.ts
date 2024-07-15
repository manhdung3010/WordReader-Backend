import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { Discount } from './entities/discount.entity';
import { FilterDiscountDto } from './dto/filter-discount.dto';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
  ) {}

  async create(createDiscountDto: CreateDiscountDto): Promise<Discount> {
    const newDiscount = this.discountRepository.create(createDiscountDto);
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
      skip: skip,
      take: pageSize,
      where: this.buildWhereClause(filter),
    };

    try {
      const [discounts, totalElements] =
        await this.discountRepository.findAndCount(options);
      return [discounts, totalElements];
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

    return where;
  }

  async findOne(id: number): Promise<Discount> {
    try {
      const discount = await this.discountRepository.findOne({ where: { id } });
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

  async update(
    id: number,
    updateDiscountDto: UpdateDiscountDto,
  ): Promise<Discount> {
    try {
      await this.discountRepository.update(id, updateDiscountDto);
      const updateDiscount = await this.findOne(id);
      return updateDiscount;
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
}
