import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './schemas/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateSubCommentDto } from './dto/create-sub-comment.dto';
import { SubComment } from './schemas/subcomment.schema';
import { Response } from 'express';
import { MeDto } from '../auth/dto/me-dto';
import { Club } from '../club/club.schema';
import { checkAccess } from '../logic';
import { User } from '../user/user.schema';
import { FindOneParams } from '../types';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Club.name)
    private clubModel: Model<Club>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Comment.name)
    private commentModel: Model<Comment>,
    @InjectModel(SubComment.name)
    private subCommentModel: Model<SubComment>,
  ) {}

  async addComment(dto: CreateCommentDto, res: Response): Promise<Comment> {
    const club = await this.clubModel.findById(dto.club);
    if (!club) {
      throw new HttpException('Club not found!', HttpStatus.NOT_FOUND);
    }
    const user = await this.userModel.findById(dto.author);

    if (!user) {
      throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
    }
    const comment = await this.commentModel.create({
      ...dto,
      like: 0,
      dislike: 0,
      status: false,
    });
    club.comments.push(comment.id);
    await club.save();
    res.status(HttpStatus.CREATED);
    return await (
      await (
        await comment.populate({
          path: 'subComments',
          populate: [
            {
              path: 'answerToUser',
              model: 'User',
            },
            {
              path: 'author',
              model: 'User',
            },
            {
              path: 'club',
              model: 'Club',
              populate: [
                {
                  path: 'author',
                  model: 'User',
                },
              ],
            },
          ],
        })
      ).populate({
        path: 'club',
        model: 'Club',
        populate: [
          {
            path: 'author',
            model: 'User',
          },
        ],
      })
    ).populate('author');
  }

  async addSubComment(
    dto: CreateSubCommentDto,
    res: Response,
  ): Promise<SubComment> {
    let mainComment = await this.commentModel.findById(dto.replyToComment);

    if (!mainComment && dto.mainComment) {
      mainComment = await this.commentModel.findById(dto.mainComment);
    }

    if (mainComment) {
      const subCommentCreate = await this.subCommentModel.create({
        ...dto,
        like: 0,
        dislike: 0,
        status: false,
      });

      mainComment.subComments.push(subCommentCreate.id);
      await mainComment.save();
      res.status(HttpStatus.CREATED);
      return subCommentCreate.populate([
        {
          path: 'answerToUser',
          model: 'User',
        },
        {
          path: 'author',
          model: 'User',
        },
        {
          path: 'club',
          model: 'Club',
          populate: [
            {
              path: 'author',
              model: 'User',
            },
          ],
        },
      ]);
    }

    throw new HttpException('Comment not found!', HttpStatus.NOT_FOUND);
  }

  async getAll(): Promise<Array<Comment>> {
    const comments = this.commentModel.find().populate('subComments');
    if (!comments) {
      throw new HttpException('Comments not found', HttpStatus.NOT_FOUND);
    }
    return comments;
  }

  async getOne(id: ObjectId): Promise<Comment> {
    const comment = await this.commentModel
      .findById(id)
      .populate('subComments');
    if (!comment) {
      throw new HttpException('Comment not found!', HttpStatus.NOT_FOUND);
    }
    return comment;
  }

  async getAllByClub(params: FindOneParams): Promise<Array<Comment>> {
    const clubId = params.id;
    const comment = await this.commentModel
      .find({ club: clubId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'subComments',
        populate: [
          {
            path: 'answerToUser',
            model: 'User',
          },
          {
            path: 'author',
            model: 'User',
          },
          {
            path: 'club',
            model: 'Club',
            populate: [
              {
                path: 'author',
                model: 'User',
              },
            ],
          },
        ],
      })
      .populate({
        path: 'club',
        model: 'Club',
        populate: [
          {
            path: 'author',
            model: 'User',
          },
        ],
      })
      .populate('author');
    if (!comment) {
      throw new HttpException('Comments not found!', HttpStatus.NOT_FOUND);
    }
    return comment;
  }

  async delete(id: ObjectId, req: { user: MeDto }): Promise<Comment> {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new HttpException('Comment not found!', HttpStatus.NOT_FOUND);
    }

    if (comment) {
      await checkAccess(comment.author, req.user);
    }

    await this.commentModel.findByIdAndDelete(id);

    const subCommentsToDelete = await this.subCommentModel
      .find({ mainComment: comment._id })
      .exec();

    for (const subComment of subCommentsToDelete) {
      await this.subCommentModel.deleteOne({ _id: subComment._id });
    }

    const club = await this.clubModel
      .findOneAndUpdate(
        { comments: comment._id },
        { $pull: { comments: comment._id } },
        { new: true },
      )
      .exec();
    if (club) {
      return comment;
    } else {
      throw new HttpException(
        'Club not found!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteCommentByClubId(clubId: Types.ObjectId) {
    const comments = await this.commentModel.find({ club: clubId }).exec();
    const commentIds = comments.map((comment) => comment._id);
    await this.commentModel.deleteMany({ _id: { $in: commentIds } });
    await this.subCommentModel.deleteMany({ mainComment: { $in: commentIds } });
    return {
      deletedComments: comments.length,
      deletedSubComments: commentIds.length,
    };
  }

  async deleteSub(id: ObjectId, req: { user: MeDto }): Promise<SubComment> {
    const subComment = await this.subCommentModel.findById(id);

    if (!subComment) {
      throw new HttpException('SubComment not found!', HttpStatus.NOT_FOUND);
    }

    if (subComment) {
      await checkAccess(subComment.author, req.user);
    }

    await this.subCommentModel.findByIdAndDelete(id);

    const parentCommentUpdate = await this.commentModel
      .findOneAndUpdate(
        { subComments: subComment._id },
        { $pull: { subComments: subComment._id } },
        { new: true },
      )
      .exec();

    if (parentCommentUpdate) {
      return subComment;
    } else {
      throw new HttpException(
        'Parent comment not found!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async handleLike(
    commentModel: Model<Comment | SubComment>,
    id: Types.ObjectId,
    field: string,
    req: { user: MeDto },
  ) {
    const userId = req.user.sub;
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const comment = await commentModel.findById(id);

    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }

    const existingAction = await commentModel.findOne({ [field]: userId });

    if (existingAction) {
      if (comment[field].includes(userId)) {
        comment[field] = comment[field].filter(
          (userId: Types.ObjectId) => !userId.equals(userId),
        );
        comment.like -= field === 'usersWhoLiked' ? 1 : 0;
        await comment.save();
        return {
          message: 'Like removed',
          comment,
        };
      } else {
        comment[field].push(userId);
        comment.like += field === 'usersWhoLiked' ? 1 : 0;
        await comment.save();
        return {
          message: 'Like added',
          comment,
        };
      }
    } else {
      comment[field].push(userId);
      comment.like += field === 'usersWhoLiked' ? 1 : 0;
      await comment.save();
      return {
        message: 'Like added',
        comment,
      };
    }
  }
}
