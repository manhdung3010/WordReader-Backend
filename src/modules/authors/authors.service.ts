import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { FilterAuthorDto } from './dto/filter-author.dto';
import { Author } from './entities/author.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorsRepository: Repository<Author>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const newAuthor = this.authorsRepository.create(createAuthorDto);
    try {
      return await this.authorsRepository.save(newAuthor);
    } catch (error) {
      throw new Error(`Failed to create author: ${error.message}`);
    }
  }

  async findAll(filter: FilterAuthorDto): Promise<[Author[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const whereClause = this.buildWhereClause(filter);

    const options: FindManyOptions<Author> = {
      where: whereClause,
      skip: skip,
      take: pageSize,
    };

    try {
      const [authors, totalElements] =
        await this.authorsRepository.findAndCount(options);
      return [authors, totalElements];
    } catch (error) {
      throw new Error(`Failed to retrieve authors: ${error.message}`);
    }
  }

  private buildWhereClause(filter: Partial<FilterAuthorDto>): any {
    const where: any = {};

    if (filter.name) {
      where.name = filter.name;
    }

    if (filter.nationality) {
      where.nationality = filter.nationality;
    }

    return where;
  }

  async findOne(id: number): Promise<Author> {
    try {
      const author = await this.authorsRepository.findOne({ where: { id } });
      if (!author) {
        throw new NotFoundException(`Author with id ${id} not found`);
      }
      return author;
    } catch (error) {
      throw new Error(`Failed to find author with id ${id}: ${error.message}`);
    }
  }

  async update(id: number, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    try {
      await this.authorsRepository.update(id, updateAuthorDto);
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
    await this.authorsRepository.remove(category);
    return { message: `Author with ID ${id} has been successfully removed` };
  }
}
