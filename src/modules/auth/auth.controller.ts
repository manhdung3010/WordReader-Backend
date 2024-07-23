import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ConflictException,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayloadDto } from './dto/auth.dto';
import { ResponseData } from 'src/common/global/globalClass';
import { HttpMessage } from 'src/common/global/globalEnum';
import { ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { AuthUser } from 'src/common/decorators/http.decorators';

@ApiTags('Authenticate')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() authPayload: AuthPayloadDto) {
    const { access_token, user } = await this.authService.logIn(
      authPayload.identifier,
      authPayload.password,
    );
    return new ResponseData<any>(
      { access_token, ...user },
      HttpStatus.OK,
      HttpMessage.SUCCESS,
    );
  }

  @Post('register')
  async register(@Body() authPayload: RegisterDto) {
    try {
      const newUser = await this.authService.register(authPayload);
      return new ResponseData<any>(
        newUser,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseData<any>(null, HttpStatus.CONFLICT, error.message);
      }
      return new ResponseData<any>(null, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @AuthUser()
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Req() req: any,
  ) {
    try {
      const user = req.user;
      const newUser = await this.authService.forgotPassword(
        forgotPasswordDto,
        user,
      );
      return new ResponseData<any>(
        newUser,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        return new ResponseData<any>(null, HttpStatus.CONFLICT, error.message);
      }
      return new ResponseData<any>(null, HttpStatus.BAD_REQUEST, error.message);
    }
  }
}
