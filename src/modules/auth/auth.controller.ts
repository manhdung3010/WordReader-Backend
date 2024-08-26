import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayloadDto } from './dto/auth.dto';
import { ResponseData } from 'src/common/global/globalClass';
import { HttpMessage } from 'src/common/global/globalEnum';
import { ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { AuthUser } from 'src/common/decorators/http.decorators';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Authenticate')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() authPayload: AuthPayloadDto) {
    const { accessToken, user } = await this.authService.logIn(
      authPayload.identifier,
      authPayload.password,
    );
    return new ResponseData<any>(
      { accessToken, ...user },
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
      return new ResponseData<any>(null, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleLogin(@Req() req) {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req) {
    try {
      const data = await this.authService.googleLogin(req.user);
      return new ResponseData<any>(
        data,
        HttpStatus.CREATED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<any>(null, HttpStatus.BAD_REQUEST, error.message);
    }
  }
}
