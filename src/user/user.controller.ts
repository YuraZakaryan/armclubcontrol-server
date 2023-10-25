import {
  Controller,
  Get,
  HttpStatus,
  Param,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../guard/role/role.guard';
import { Roles, UserRole } from '../guard/role/roles.decorator';
import { FindOneParams } from '../types';
import { ValidationPipe } from '../pipes/validation.pipe';

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
}
