import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Get,
  Res,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayloadDto } from './dto/auth.dto';
import { ResponseData } from 'src/common/global/globalClass';
import { HttpMessage } from 'src/common/global/globalEnum';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { AuthUser } from 'src/common/decorators/http.decorators';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change-password';
import { GoogleLoginDto } from './dto/login-google';

@ApiTags('Authenticate')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() authPayload: AuthPayloadDto) {
    try {
      const { accessToken, user } = await this.authService.logIn(
        authPayload.identifier,
        authPayload.password,
      );
      return new ResponseData<any>(
        { accessToken, ...user },
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<any>(null, HttpStatus.BAD_REQUEST, error.message);
    }
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
  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: any,
  ) {
    try {
      const user = req.user;
      const newUser = await this.authService.changePassword(
        changePasswordDto,
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

  @Post('google/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Google' })
  @ApiResponse({ status: 200, description: 'Successfully logged in with Google' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async googleLoginWithToken(@Body() googleLoginDto: GoogleLoginDto) {
    try {
      // Call the service method to handle Google login
      const { accessToken, user } = await this.authService.googleLogin(googleLoginDto);
      
      return new ResponseData<any>(
        { accessToken, ...user },
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData<any>(
        null, 
        HttpStatus.BAD_REQUEST, 
        error.message || 'Google authentication failed'
      );
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleLogin(@Req() req) {}

  @Get('google/callback')
  async googleCallback(@Req() req: any, @Res() res: any) {
    try {
      const profile = req.user; // Lấy thông tin user từ Google (passport middleware)
      if (!profile) {
        throw new HttpException('No user from Google', HttpStatus.BAD_REQUEST);
      }

      const { accessToken, user } = await this.authService.googleLogin(profile);

      // Chuyển hướng về FE với query params
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const encodedUser = encodeURIComponent(JSON.stringify(user));

      return res.redirect(
        `${frontendUrl}/login?accessToken=${accessToken}&user=${encodedUser}`,
      );
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(error.message)}`,
      );
    }
  }
}
