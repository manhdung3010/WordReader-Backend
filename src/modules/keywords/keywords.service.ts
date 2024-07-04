import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Keyword } from './entities/keyword.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { FilterKeywordDto } from './dto/filter-keyword.dto';


@Injectable()
export class KeywordsService {
  constructor(
    @InjectRepository(Keyword)
    private readonly keywordRepository: Repository<Keyword>,
  ) {}

  async create(createKeywordDto: CreateKeywordDto): Promise<Keyword> {
    const newAuthor = this.keywordRepository.create(createKeywordDto);
    try {
      return await this.keywordRepository.save(newAuthor);
    } catch (error) {
      throw new Error(`Failed to create author: ${error.message}`);
    }
  }

  async findAll(filter: FilterKeywordDto): Promise<[Keyword[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const whereClause = this.buildWhereClause(filter);

    const options: FindManyOptions<Keyword> = {
      where: whereClause,
      skip: skip,
      take: pageSize,
    };

    try {
      const [authors, totalElements] =
        await this.keywordRepository.findAndCount(options);
      return [authors, totalElements];
    } catch (error) {
      throw new Error(`Failed to retrieve authors: ${error.message}`);
    }
  }

  private buildWhereClause(filter: Partial<FilterKeywordDto>): any {
    const where: any = {};

    if (filter.name) {
      where.name = filter.name;
    }

    if (filter.code) {
      where.code = filter.code;
    }

    return where;
  }

  async findOne(id: number): Promise<Keyword> {
    try {
      const author = await this.keywordRepository.findOne({ where: { id } });
      if (!author) {
        throw new NotFoundException(`Author with id ${id} not found`);
      }
      return author;
    } catch (error) {
      throw new Error(`Failed to find author with id ${id}: ${error.message}`);
    }
  }

  async update(id: number, updateKeywordDto: UpdateKeywordDto): Promise<Keyword> {
    try {
      await this.keywordRepository.update(id, updateKeywordDto);
      const updatedAuthor = await this.findOne(id);
      return updatedAuthor;
    } catch (error) {
      throw new Error(
        `Failed to update author with id ${id}: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.keywordRepository.remove(category);
    return { message: `Keyword with ID ${id} has been successfully removed` };
  }
}
