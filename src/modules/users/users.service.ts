import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { Repository } from 'typeorm';
import { FilterUserDto } from './dto/filter-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Users> {
    const newUser = this.userRepository.create(createUserDto);
    try {
      return await this.userRepository.save(newUser);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Username or email already exists');
      }
      throw error;
    }
  }

  async findAll(filter: FilterUserDto): Promise<[Users[], number]> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const whereClause = this.buildWhereClause(filter);

    const [users, totalElements] = await this.userRepository.findAndCount({
      where: whereClause,
      skip: skip,
      take: pageSize,
    });

    return [users, totalElements];
  }

  private buildWhereClause(filter: Partial<FilterUserDto>): any {
    const where: any = {};

    if (filter.username) {
      where.username = filter.username;
    }

    if (filter.email) {
      where.email = filter.email;
    }

    if (filter.gender) {
      where.gender = filter.gender;
    }

    if (filter.role) {
      where.role = filter.role;
    }
    return where;
  }

  async findOne(id: number): Promise<Users | string> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return `User with ID ${id} not found`;
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<Users | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOneByName(username: string): Promise<Users> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async findOneByUsernameOrEmail(
    identifier: string,
  ): Promise<Users | undefined> {
    return this.userRepository.findOne({
      where: [{ username: identifier }, { email: identifier }],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<Users> {
    const user = await this.userRepository.preload({
      id: +id,
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
