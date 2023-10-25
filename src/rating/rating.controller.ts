import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { SetRatingDto } from './dto/set-rating.dto';
import { Rating } from './rating.schema';
import { RatingService } from './rating.service';
import { ObjectId } from 'mongoose';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
@ApiTags('Rating')
@Controller('/rating')
export class RatingController {
  constructor(private ratingService: RatingService) {}
  @ApiOperation({ summary: 'Set rating club' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Rating successfully added',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Club not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @Post()
  setRating(
    @Body() dto: SetRatingDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Rating | { rating: Rating; message: string }> {
    return this.ratingService.setRating(dto, res);
  }
  @ApiOperation({ summary: 'Get rating by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Rating not found',
  })
  @ApiParam({ name: 'id', description: 'rating' })
  @Get(':id')
  getOne(@Param('id') id: ObjectId): Promise<Rating> {
    return this.ratingService.getOne(id);
  }
  @ApiOperation({ summary: 'Get rating average by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Rating not found',
  })
  @ApiParam({ name: 'id', description: 'club' })
  @Get('average/:id')
  getAverageByAppId(@Param('id') id: ObjectId) {
    return this.ratingService.getAverageByClubId(id);
  }
  @ApiOperation({ summary: 'Get all ratings' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ratings not found',
  })
  @Get()
  async getAll(): Promise<Array<Rating>> {
    return this.ratingService.getAll();
  }
}
