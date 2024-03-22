import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FavouriteAndLastVisitedService } from './favourite-history-club.service';
import { FavouriteClub } from './schema/favourite.schema';
import { FindOneParams, TFetchBody, TResponseMessage } from '../types';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeDto } from '../auth/dto/me-dto';
import { Club } from '../club/club.schema';

@ApiTags('Favourite and Last visited clubs')
@Controller('favourite-history-club')
export class FavouriteHistoryClubController {
  constructor(
    private favouriteAndLastVisitedService: FavouriteAndLastVisitedService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add and remove club to(from) favourites' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Club not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiParam({ name: 'clubId', description: 'club id' })
  @Post('favourite/manage/:id')
  manageFavourite(
    @Param() dto: FindOneParams,
    @Req() req: { user: MeDto },
  ): Promise<TResponseMessage> {
    return this.favouriteAndLastVisitedService.manageFavourite(dto, req);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add and remove club to(from) histories' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Club not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiParam({ name: 'clubId', description: 'club id' })
  @Post('history-club/manage/:id')
  manageHistory(
    @Param() dto: FindOneParams,
    @Req() req: { user: MeDto },
  ): Promise<TResponseMessage> {
    return this.favouriteAndLastVisitedService.manageHistory(dto, req);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all favourite clubs' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Clubs not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @Get('favourite')
  getFavouriteClubsByUserId(@Req() req: { user: MeDto }) {
    return this.favouriteAndLastVisitedService.getFavouriteClubsByUserId(req);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all history of clubs' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Clubs not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @Get('history-club')
  getClubHistoriesByUserId(@Req() req: { user: MeDto }) {
    return this.favouriteAndLastVisitedService.getClubHistoriesByUserId(req);
  }
}
