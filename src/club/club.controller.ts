import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../guard/role/role.guard';
import { Roles, UserRole } from '../guard/role/roles.decorator';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateClubWithPictureDto } from './dto/create-club-with-picture.dto';
import { Response } from 'express';
import { CreateClubDto } from './dto/create-club.dto';
import { Club } from './club.schema';
import { ClubService } from './club.service';
import { MeDto } from '../auth/dto/me-dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FindOneParams } from '../types';
@ApiTags('Club')
@Controller('/club')
export class ClubController {
  constructor(private clubService: ClubService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create club' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Club created successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateClubWithPictureDto })
  @Post('create')
  create(
    @UploadedFile() picture: Express.Multer.File,
    @Body() dto: CreateClubDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Club> {
    return this.clubService.create(dto, picture, res);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Update club' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Club updated successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Club not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateClubWithPictureDto })
  @ApiParam({ name: 'id' })
  @Put(':id')
  update(
    @Param() params: FindOneParams,
    @UploadedFile() picture: Express.Multer.File,
    @Body() dto: CreateClubDto,
    @Req() req: { user: MeDto },
  ) {
    console.log(params);
    // return this.clubService.update(params, dto, picture, req);
  }

  @ApiOperation({ summary: 'Search club by title' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Club not found' })
  @Get('search')
  search(@Query('title') title: string) {
    return this.clubService.search(title);
  }

  @ApiOperation({ summary: 'Get all club' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Clubs not found' })
  @Get('all')
  getAll(
    @Query('count') count: number,
    @Query('offset') offset: number,
  ): Promise<Array<Club>> {
    return this.clubService.getAll(count, offset);
  }

  @ApiOperation({ summary: 'Get club by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Club not found' })
  @ApiParam({ name: 'id', description: 'Club' })
  @Get(':id')
  getOne(@Param('id') id: ObjectId): Promise<Club> {
    return this.clubService.getOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete club by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Club successfully deleted',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Club not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  delete(
    @Param('id') id: ObjectId,
    @Req() req: { user: MeDto },
  ): Promise<Club> {
    return this.clubService.delete(id, req);
  }

  @ApiOperation({ summary: 'view club by id' })
  @ApiResponse({ status: 200, description: 'Club successfully viewed' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Club not found' })
  @ApiParam({ name: 'id' })
  @Put('view/:id')
  view(@Param('id') id: ObjectId) {
    return this.clubService.view(id);
  }
}
