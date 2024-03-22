import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MeDto } from 'src/auth/dto/me-dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from '../guard/role/role.guard';
import { Roles, UserRole } from '../guard/role/roles.decorator';
import { FindOneParams } from '../types';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { UpdatePasswordUserDto } from './dto/update-password-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.schema';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('/user')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Users not found' })
  @Get()
  getAll(): Promise<Array<User>> {
    return this.userService.getAll();
  }
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Users not found' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not auth!',
  })
  @ApiBearerAuth()
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiParam({
    name: 'id',
    description: 'User ID for password update',
    type: String,
  })
  @Put('update/:id')
  update(
    @Param() params: FindOneParams,
    @Body() dto: UpdateUserDto,
    @Req() req: { user: MeDto },
  ) {
    return this.userService.update(params, dto, req);
  }
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Update password of user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User password is changed successfully !',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Users not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Old and new passwords must be different',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Old password is wrong',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not auth!',
  })
  @ApiBearerAuth()
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiParam({
    name: 'id',
    description: 'User ID for password update',
    type: String,
  })
  @Put('update/password/:id')
  updatePassword(
    @Param() params: FindOneParams,
    @Body() dto: UpdatePasswordUserDto,
    @Req() req: { user: MeDto },
  ) {
    return this.userService.updatePassword(params, dto, req);
  }
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'FOUND' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  getOne(@Param() params: FindOneParams): Promise<User> {
    return this.userService.getOne(params);
  }
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Send OTP to mail' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTP {{code}} successfully sended to mail {{mail}}',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User activated previously',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error while sending opt code to mail',
  })
  @ApiParam({ name: 'id' })
  @Post('mail/otp/:id')
  sendOtpToMail(
    @Body() dto: SendOtpDto,
    @Param() param: FindOneParams,
    @Req() req: { user: MeDto },
  ) {
    return this.userService.sendOtpToMail(dto, param, req);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Confirm account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account {{mail}} successfully activated!',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User activated previously',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description:
      'One-Time Password has expired. Please request a new OTP / One-Time Password is wrong!',
  })
  @ApiParam({ name: 'id' })
  @Put('activation/:id')
  confirmAccountWithEmail(
    @Param() param: FindOneParams,
    @Body() dto: ConfirmAccountDto,
    @Req() req: { user: MeDto },
  ) {
    return this.userService.confirmAccountWithEmail(param, dto, req);
  }
}
