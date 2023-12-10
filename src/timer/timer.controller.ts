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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateTimerDto } from './dto/create-timer.dto';
import { Timer } from './timer.schema';
import { TimerService } from './timer.service';
import { Response } from 'express';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { UpdateTimerDto } from './dto/update-timer.dto';
import { FindOneParams, TMessage } from '../types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeDto } from '../auth/dto/me-dto';
import { StartTimerDto } from './dto/start-timer.dto';
import { UpdateTimerInfoDto } from './dto/update-timer-info.dto';

@ApiTags('Timer')
@Controller('/club/timer')
export class TimerController {
  constructor(private timerService: TimerService) {}
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create timer' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Timer created successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Timer not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @Post()
  create(
    @Body() dto: CreateTimerDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Timer> {
    console.log(dto);
    return this.timerService.create(dto, res);
  }
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update timer by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comment not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'ID', description: 'timer' })
  @Put(':id')
  update(
    @Param('id') id: Types.ObjectId,
    @Body() dto: UpdateTimerDto,
    @Req() req: { user: MeDto },
  ) {
    return this.timerService.update(id, dto, req);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Update timer information by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comment not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'ID', description: 'timer' })
  @Put('/info/:id')
  updateInfo(
    @Param() params: FindOneParams,
    @Body() dto: UpdateTimerInfoDto,
    @Req() req: { user: MeDto },
  ): Promise<void> {
    return this.timerService.updateInfo(params, dto, req);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Pause timer by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Timer paused / continue',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Timer not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'ID', description: 'timer' })
  @Put('start/:id')
  start(
    @Param('id') id: Types.ObjectId,
    @Body() dto: StartTimerDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: { user: MeDto },
  ) {
    return this.timerService.start(id, dto, req);
  }
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Pause timer by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Timer paused / continue',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Timer not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'ID', description: 'timer' })
  @Put('pause/:id')
  pause(
    @Param('id') id: Types.ObjectId,
    @Body() dto: StartTimerDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: { user: MeDto },
  ): Promise<TMessage> {
    return this.timerService.pause(id, dto, req);
  }
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Stop timer by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Timer stopped' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Timer not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'ID', description: 'timer' })
  @Put('stop/:id')
  stop(
    @Param('id') id: Types.ObjectId,
    @Res({ passthrough: true }) res: Response,
    @Req() req: { user: MeDto },
  ) {
    return this.timerService.stop(id, req);
  }
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete timer by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Timer not found' })
  @ApiParam({ name: 'ID', description: 'timer' })
  @Delete(':id')
  delete(
    @Param() params: FindOneParams,
    @Res({ passthrough: true }) res: Response,
    @Req() req: { user: MeDto },
  ) {
    return this.timerService.delete(params, res, req);
  }
}
