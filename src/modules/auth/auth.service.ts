/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthMessage } from 'src/common/constants/auth-message.enum';
import { RegisterDto } from './dto/register.dto';
import { Users } from '../users/entities/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password';
import { GoogleLoginDto } from './dto/login-google';

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

  async googleLogin(
    googleProfile: GoogleLoginDto,
  ): Promise<{ accessToken: string; user: any }> {
    try {
      if (!googleProfile || !googleProfile.email) {
        throw new HttpException(
          'Invalid Google profile data',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if user exists by Google ID
      let user = await this.usersService.findOneByGoogleId(
        googleProfile.googleId,
      );

      if (!user) {
        // If no user with this Google ID, check by email
        user = await this.usersService.findOneByEmail(googleProfile.email);

        if (user) {
          // If user with this email exists, update their Google ID
          user.googleId = googleProfile.googleId;
          if (!user.avatar && googleProfile.photo) {
            user.avatar = googleProfile.photo;
          }
          await this.userRepository.save(user);
        } else {
          // Create new user from Google profile
          user = new Users();
          user.email = googleProfile.email;
          user.fullName = googleProfile.displayName;
          user.avatar = googleProfile.photo;
          user.googleId = googleProfile.googleId;

          // Create a unique username if the provided one already exists
          const baseUsername =
            googleProfile.username || googleProfile.email.split('@')[0];
          user.username = await this.generateUniqueUsername(baseUsername);

          // Save the new user
          user = await this.userRepository.save(user);
        }
      } else {
        // Update existing user's profile info if needed
        let needsUpdate = false;

        if (!user.avatar && googleProfile.photo) {
          user.avatar = googleProfile.photo;
          needsUpdate = true;
        }

        if (!user.fullName && googleProfile.displayName) {
          user.fullName = googleProfile.displayName;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await this.userRepository.save(user);
        }
      }

      // Generate JWT token
      const payload = {
        sub: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      });

      // Remove sensitive data before returning user object
      const { password, ...userWithoutPassword } = user;

      return { accessToken, user: userWithoutPassword };
    } catch (error) {
      console.error('Google login error:', error);
      throw new HttpException(
        error.message || 'Google authentication failed',
        HttpStatus.BAD_REQUEST,
      );
    }
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

  async changePassword(
    changePassword: ChangePasswordDto,
    user: any,
  ): Promise<Users> {
    const existingUser = (await this.usersService.findOneDetail(
      user.userId,
    )) as Users;

    if (!existingUser) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePassword.oldPassword,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new Error('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePassword.newPassword, 12);
    existingUser.password = hashedPassword;
    await this.usersService.update(existingUser.id, existingUser);

    return existingUser;
  }
}
