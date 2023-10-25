import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './schemas/comment.schema';
import { CommentService } from './comment.service';
import { ObjectId } from 'mongoose';
import { CreateSubCommentDto } from './dto/create-sub-comment.dto';
import { SubComment } from './schemas/subcomment.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { MeDto } from '../auth/dto/me-dto';

@ApiTags('Comment')
@Controller('/club/comment')
export class CommentController {
  constructor(private commentService: CommentService) {}
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add comment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Comment added successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Club not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @Post()
  addComment(
    @Body() dto: CreateCommentDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Comment> {
    return this.commentService.addComment(dto, res);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add sub comment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sub comment added successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comment not Found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @Post('sub')
  addSubComment(
    @Body() dto: CreateSubCommentDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SubComment> {
    return this.commentService.addSubComment(dto, res);
  }
  @ApiOperation({ summary: 'Get all comments' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comments not found',
  })
  @Get('all')
  getAll(): Promise<Array<Comment>> {
    return this.commentService.getAll();
  }

  @ApiOperation({ summary: 'Get comment by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comment not found',
  })
  @ApiParam({ name: 'id' })
  @Get(':id')
  getOne(@Param('id') id: ObjectId): Promise<Comment> {
    return this.commentService.getOne(id);
  }
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete comment by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comment not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  delete(@Req() req: { user: MeDto }, @Param('id') id: ObjectId) {
    return this.commentService.delete(id, req);
  }
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete sub comment by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sub comment successfully deleted',
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sub comment not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'id' })
  @Delete('sub/:id')
  deleteSub(
    @Req() req: { user: MeDto },
    @Param('id') id: ObjectId,
  ): Promise<SubComment> {
    return this.commentService.deleteSub(id, req);
  }
}
