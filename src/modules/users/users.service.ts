import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { Between, Repository } from 'typeorm';
import { FilterUserDto } from './dto/filter-user.dto';
import { instanceToPlain } from 'class-transformer';
import { UserStatus } from 'src/common/enums/user-status.enum';

interface UserStats {
  totalUsers: {
    count: number;
    weekChange: string;
  };
  activeUsers: {
    count: number;
    weekChange: string;
  };
  inactiveUsers: {
    count: number;
    weekChange: string;
  };
}

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

    const plainUsers = instanceToPlain(users) as Users[];

    return [plainUsers, totalElements];
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

    if (filter.status) {
      where.status = filter.status;
    }

    return where;
  }

  async findOne(id: number): Promise<Users | string> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['orders'],
    });
    if (!user) {
      return `User with ID ${id} not found`;
    }

    const plainUsers = instanceToPlain(user) as Users;

    return plainUsers;
  }

  async findOneDetail(id: number): Promise<Users | string> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['orders'],
    });
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

  async findOneByGoogleId(googleId: string): Promise<Users | undefined> {
    return await this.userRepository.findOne({ where: { googleId } });
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

  async getUserStats(): Promise<UserStats> {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const startOfLastWeek = new Date(startOfWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

      // Total Users
      const totalUsers = await this.userRepository.count();
      const usersLastWeekTotal = await this.userRepository.count({
        where: {
          createdAt: Between(startOfLastWeek, startOfWeek),
        },
      });

      const weekChangeTotal =
        usersLastWeekTotal > 0
          ? (totalUsers - usersLastWeekTotal) / usersLastWeekTotal
          : 0;

      console.log(usersLastWeekTotal);

      // Active Users
      const activeUsers = await this.userRepository.count({
        where: { status: UserStatus.active },
      });
      const activeUsersLastWeek = await this.userRepository.count({
        where: {
          status: UserStatus.active,
          createdAt: Between(startOfLastWeek, startOfWeek),
        },
      });
      const weekChangeActive =
        activeUsersLastWeek > 0
          ? (activeUsers - activeUsersLastWeek) / activeUsersLastWeek
          : 0;

      // Inactive Users
      const inactiveUsers = await this.userRepository.count({
        where: { status: UserStatus.inactive },
      });
      const inactiveUsersLastWeek = await this.userRepository.count({
        where: {
          status: UserStatus.inactive,
          createdAt: Between(startOfLastWeek, startOfWeek),
        },
      });

      const weekChangeInactive =
        inactiveUsersLastWeek > 0
          ? (inactiveUsers - inactiveUsersLastWeek) / inactiveUsersLastWeek
          : 0;

      return {
        totalUsers: {
          count: totalUsers,
          weekChange: weekChangeTotal.toFixed(2),
        },
        activeUsers: {
          count: activeUsers,
          weekChange: weekChangeActive.toFixed(2),
        },
        inactiveUsers: {
          count: inactiveUsers,
          weekChange: weekChangeInactive.toFixed(2),
        },
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to retrieve user statistics.');
    }
  }
}
