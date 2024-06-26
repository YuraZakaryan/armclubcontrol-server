import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './schemas/comment.schema';
import { CommentService } from './comment.service';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateSubCommentDto } from './dto/create-sub-comment.dto';
import { SubComment } from './schemas/subcomment.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { MeDto } from '../auth/dto/me-dto';
import { InjectModel } from '@nestjs/mongoose';
import { FindOneParams } from '../types';

@ApiTags('Comment')
@Controller('/club/comment')
export class CommentController {
  constructor(
    private commentService: CommentService,
    @InjectModel('Comment') private readonly commentModel: Model<Comment>,
    @InjectModel('SubComment')
    private readonly subCommentModel: Model<SubComment>,
  ) {}
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Like added, removed' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Like added',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Like removed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comment not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiParam({ name: 'id' })
  @Put('like/:id')
  likeComment(@Param('id') id: Types.ObjectId, @Req() req: { user: MeDto }) {
    return this.commentService.handleLike(
      this.commentModel,
      id,
      'usersWhoLiked',
      req,
    );
  }
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Like added, removed' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Like added',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Like removed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comment not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiParam({ name: 'id' })
  @Put('like/sub/:id')
  likeSubComment(@Param('id') id: Types.ObjectId, @Req() req: { user: MeDto }) {
    return this.commentService.handleLike(
      this.subCommentModel,
      id,
      'usersWhoLiked',
      req,
    );
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
  @ApiOperation({ summary: 'Get comments by club id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comments not found',
  })
  @UsePipes(ValidationPipe)
  @ApiParam({ name: 'id' })
  @Get('/by-club/:id')
  getOneByClub(@Param() params: FindOneParams): Promise<Array<Comment>> {
    return this.commentService.getAllByClub(params);
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
