import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthMessage } from 'src/common/constants/auth-message.enum';
import { RegisterDto } from './dto/register.dto';
import { Users } from '../users/entities/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

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
  ): Promise<{ accessToken: string; user: any }> {
    const user = await this.usersService.findOneByUsernameOrEmail(identifier);

    if (!user) {
      throw new Error(AuthMessage.NOT_FOUND);
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new Error(AuthMessage.INVALID_PASSWORD);
    }

    const payload = {
      sub: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken, user };
  }

  async googleLogin(profile: any): Promise<{ accessToken: string; user: any }> {
    if (!profile) {
      throw new HttpException('No user from Google', HttpStatus.BAD_REQUEST);
    }

    let user = await this.usersService.findOneByGoogleId(profile.googleId);

    if (!user) {
      user = await this.usersService.findOneByEmail(profile.email);

      if (user) {
        user.googleId = profile.googleId;
        await this.userRepository.save(user);
      } else {
        user = new Users();
        user.email = profile.email;
        user.fullName = profile.displayName;
        user.avatar = profile.photo;
        user.googleId = profile.googleId;

        const baseUsername = profile.username || profile.email.split('@')[0];
        user.username = await this.generateUniqueUsername(baseUsername);

        user = await this.userRepository.save(user);
      }
    }

    const payload = {
      sub: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return { accessToken, user };
  }

  private async generateUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername;
    let counter = 1;

    while (await this.usersService.findOneByUsernameOrEmail(username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }

  async register(authPayload: RegisterDto): Promise<Users> {
    const existingUser = await this.usersService.findOneByName(
      authPayload.username,
    );
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const existingUserEmail = await this.usersService.findOneByEmail(
      authPayload.email,
    );
    if (existingUserEmail) {
      throw new Error('Email already exists');
    }

    const hashPassword = await bcrypt.hash(authPayload.password, 12);

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

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
    user: any,
  ): Promise<Users> {
    const existingUser = (await this.usersService.findOneDetail(
      user.userId,
    )) as Users;

    if (!existingUser) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      forgotPasswordDto.oldPassword,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new Error('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(forgotPasswordDto.newPassword, 12);
    existingUser.password = hashedPassword;
    await this.usersService.update(existingUser.id, existingUser);

    return existingUser;
  }
}
