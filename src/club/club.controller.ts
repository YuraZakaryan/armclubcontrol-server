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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Types } from 'mongoose';
import { MeDto } from '../auth/dto/me-dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FindOneParams } from '../types';
import { Club } from './club.schema';
import { ClubService } from './club.service';
import { CreateClubWithPictureDto } from './dto/create-club-with-picture.dto';
import { CreateClubDto } from './dto/create-club.dto';
@ApiTags('Club')
@Controller('/club')
export class ClubController {
  constructor(private clubService: ClubService) {}

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'picture', maxCount: 1 },
      { name: 'posterPicture', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateClubWithPictureDto })
  @Post('create')
  create(
    @UploadedFiles()
    pictures: {
      picture: Express.Multer.File;
      posterPicture?: Express.Multer.File;
    },
    @Body() dto: CreateClubDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const picture = Array.isArray(pictures.picture)
      ? pictures.picture[0]
      : null;
    const posterPicture = Array.isArray(pictures.posterPicture)
      ? pictures.posterPicture[0]
      : null;

    return this.clubService.create(dto, picture, posterPicture, res);
  }

  @UseGuards(JwtAuthGuard)
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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'picture', maxCount: 1 },
      { name: 'posterPicture', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateClubWithPictureDto })
  @ApiParam({ name: 'id' })
  @Put(':id')
  update(
    @Param() params: FindOneParams,
    @UploadedFiles()
    pictures: {
      picture: Express.Multer.File;
      posterPicture?: Express.Multer.File;
    },
    @Body() dto: CreateClubDto,
    @Req() req: { user: MeDto },
  ) {
    const picture = Array.isArray(pictures.picture)
      ? pictures.picture[0]
      : null;

    const posterPicture = Array.isArray(pictures.posterPicture)
      ? pictures.posterPicture[0]
      : null;

    return this.clubService.update(params, dto, picture, posterPicture, req);
  }

  @ApiOperation({ summary: 'Search club by title' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Club not found' })
  @Get('search')
  search(@Query('title') title: string): Promise<Array<Club>> {
    return this.clubService.search(title);
  }

  @ApiOperation({ summary: 'Get all club' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Clubs not found' })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'skip',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'region',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'city',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'title',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'random',
    type: 'boolean',
    required: false,
  })
  @ApiQuery({
    name: 'byRating',
    type: 'boolean',
    required: false,
  })
  @Get('all')
  getAll(
    @Query('limit') limit: number,
    @Query('skip') skip: number,
    @Query('region') region: string,
    @Query('city') city: string,
    @Query('title') title: string,
    @Query('random') random: boolean,
    @Query('byRating') byRating: boolean,
  ) {
    return this.clubService.getAll(
      limit,
      skip,
      region,
      city,
      title,
      random,
      byRating,
    );
  }

  @ApiOperation({ summary: 'Get club by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Club not found' })
  @ApiParam({ name: 'id', description: 'Club' })
  @Get(':id')
  getOne(@Param('id') id: Types.ObjectId): Promise<Club> {
    return this.clubService.getOne(id);
  }

  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get clubs by user id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Clubs not found' })
  @ApiParam({ name: 'id', description: 'userId' })
  @Get('user/:id')
  getByUserId(
    @Param() params: FindOneParams,
    @Req() req: { user: MeDto },
  ): Promise<Array<Club>> {
    return this.clubService.getByUserId(params, req);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
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
    @Param() params: FindOneParams,
    @Req() req: { user: MeDto },
  ): Promise<Club> {
    return this.clubService.delete(params, req);
  }

  @ApiOperation({ summary: 'view club by id' })
  @ApiResponse({ status: 200, description: 'Club successfully viewed' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Club not found' })
  @ApiParam({ name: 'id' })
  @Put('view/:id')
  view(@Param('id') id: Types.ObjectId): Promise<void> {
    return this.clubService.view(id);
  }
}
