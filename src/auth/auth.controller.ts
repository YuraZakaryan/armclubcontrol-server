import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/user.schema';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RefreshDto } from './dto/refresh-dto';
import { MeDto } from './dto/me-dto';
import { Response } from 'express';
import { ValidationPipe } from '../pipes/validation.pipe';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Login or Password is wrong',
  })
  @Post('login')
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'registration' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User with this username or email already exists',
  })
  @Post('registration')
  registration(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.registration(dto, res);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'refresh' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User is valid' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Refresh token is invalid',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to update user',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @Put('refresh')
  updateRefreshToken(@Body() { refresh }: RefreshDto) {
    return this.authService.updateRefreshToken(refresh);
  }
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: HttpStatus.OK, description: 'User is valid' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Token not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiOperation({ summary: 'me' })
  @Get('me')
  me(@Req() req: { user: MeDto }): Promise<User> {
    return this.authService.me(req);
  }
}
