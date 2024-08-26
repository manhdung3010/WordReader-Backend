import { Injectable } from '@nestjs/common';
import { CreateKeywordPostDto } from './dto/create-keyword-post.dto';
import { UpdateKeywordPostDto } from './dto/update-keyword-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { KeywordPost } from './entities/keyword-post.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { FilterKeywordPostDto } from './dto/filter-keyword-post.dto';

@Injectable()
export class KeywordPostService {
  constructor(
    @InjectRepository(KeywordPost)
    private readonly keywordPostRepository: Repository<KeywordPost>,
  ) {}

  async create(createKeywordPostDto: CreateKeywordPostDto): Promise<KeywordPost> {
    const newAuthor = this.keywordPostRepository.create(createKeywordPostDto);
    try {
      return await this.keywordPostRepository.save(newAuthor);
    } catch (error) {
      throw new Error(`Failed to create author: ${error.message}`);
    }
  }

  async findAll(filter: FilterKeywordPostDto): Promise<[KeywordPost[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const whereClause = this.buildWhereClause(filter);

    const options: FindManyOptions<KeywordPost> = {
      where: whereClause,
      skip: skip,
      take: pageSize,
    };

    try {
      const [authors, totalElements] =
        await this.keywordPostRepository.findAndCount(options);
      return [authors, totalElements];
    } catch (error) {
      throw new Error(`Failed to retrieve authors: ${error.message}`);
    }
  }

  private buildWhereClause(filter: Partial<FilterKeywordPostDto>): any {
    const where: any = {};

    if (filter.name) {
      where.name = filter.name;
    }

    if (filter.code) {
      where.code = filter.code;
    }

    return where;
  }

  async findOne(id: number): Promise<KeywordPost> {
    try {
      const keyword = await this.keywordPostRepository.findOne({ where: { id } });
      if (!keyword) {
        throw new Error(`keyword with id ${id} not found`);
      }
      return keyword;
    } catch (error) {
      throw new Error(`Failed to find keyword with id ${id}: ${error.message}`);
    }
  }

  async update(
    id: number,
    updateKeywordPostDto: UpdateKeywordPostDto,
  ): Promise<KeywordPost> {
    try {
      await this.keywordPostRepository.update(id, updateKeywordPostDto);
      const updatedKeyword = await this.findOne(id);
      return updatedKeyword;
    } catch (error) {
      throw new Error(
        `Failed to update keyword with id ${id}: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.keywordPostRepository.remove(category);
    return { message: `Keyword with ID ${id} has been successfully removed` };
  }
}
