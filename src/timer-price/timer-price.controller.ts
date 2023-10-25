import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TimerPriceService } from './timer-price.service';
import { CreateTimerPriceDto } from './dto/create-timer-price.dto';
import { Response } from 'express';
import { TimerPrice } from './timer-price.schema';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeDto } from '../auth/dto/me-dto';
import { UpdateTimerPriceDto } from './dto/update-timer-price.dto';

@ApiTags('Timer Price')
@Controller('timer-price')
export class TimerPriceController {
  constructor(private timerPriceService: TimerPriceService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create Price for Club' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Price successfully created',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Club not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @Post()
  create(
    @Body() dto: CreateTimerPriceDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TimerPrice> {
    return this.timerPriceService.create(dto, res);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete price for Club' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Price successfully deleted',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Price not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'ID' })
  @Delete(':id')
  delete(
    @Req() req: { user: MeDto },
    @Param('id') id: Types.ObjectId,
  ): Promise<{ price: TimerPrice; message: string }> {
    return this.timerPriceService.delete(id, req);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update price for Club' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Price successfully updated',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Price not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'ID' })
  @Put(':id')
  update(
    @Req() req: { user: MeDto },
    @Body() dto: UpdateTimerPriceDto,
    @Param('id') id: Types.ObjectId,
  ) {
    return this.timerPriceService.update(id, dto, req);
  }
}
