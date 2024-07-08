import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthMessage } from 'src/common/constants/auth-message.enum';
import { RegisterDto } from './dto/register.dto';
import { Users } from '../users/entities/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async logIn(
    identifier: string,
    password: string,
  ): Promise<{ access_token: string; user: any }> {
    const user = await this.usersService.findOneByUsernameOrEmail(identifier);

    if (!user) {
      throw new BadRequestException(AuthMessage.NOT_FOUND);
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new BadRequestException(AuthMessage.INVALID_PASSWORD);
    }

    const payload = {
      sub: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token, user };
  }

  async register(authPayload: RegisterDto): Promise<Users> {
    const existingUser = await this.usersService.findOneByName(
      authPayload.username,
    );
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashPassword = await bcrypt.hash(authPayload.password, 12);
    console.log(hashPassword);
    

    const newUser = new Users();
    newUser.username = authPayload.username;
    newUser.password = hashPassword;
    newUser.email = authPayload.email;
    newUser.fullName = authPayload.fullName;
    newUser.phoneNumber = authPayload.phoneNumber;
    newUser.date = authPayload.date;
    newUser.address = authPayload.address;
    newUser.gender = authPayload.gender;

    return await this.userRepository.save(newUser);
  }
}
