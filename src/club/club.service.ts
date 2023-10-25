import * as path from 'path';
import * as fs from 'fs';
import { Model, ObjectId, Types } from 'mongoose';
import { HttpException, HttpStatus, Injectable, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { FileService, FileType } from '../file/file.service';
import { CommentService } from '../comment/comment.service';
import { Response } from 'express';
import { CreateClubDto } from './dto/create-club.dto';
import { Club } from './club.schema';
import { FindOneParams, IUpdateData } from '../types';
import { checkAccess } from '../logic';
import { MeDto } from '../auth/dto/me-dto';
import { Rating } from '../rating/rating.schema';

@Injectable()
export class ClubService {
  constructor(
    @InjectModel(Club.name)
    private clubModel: Model<Club>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private fileService: FileService,
    private commentService: CommentService,
  ) {}

  async create(
    dto: CreateClubDto,
    picture: Express.Multer.File,
    res: Response,
  ): Promise<Club> {
    const picturePath = this.fileService.createFile(FileType.IMAGE, picture);
    const user = await this.userModel.findById(dto.author);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const club = await this.clubModel.create({
      ...dto,
      views: 0,
      rating: 0,
      picture: picturePath,
      status: false,
    });
    user.clubs.push(club.id);
    await user.save();
    res.status(HttpStatus.CREATED);
    return club;
  }

  async update(
    params: FindOneParams,
    dto: CreateClubDto,
    picture: Express.Multer.File,
    req: { user: MeDto },
  ): Promise<Club> {
    console.log(params.id);
    const id = params.id;
    const currentDate: Date = new Date();
    const isoString: string = currentDate.toISOString();
    const currentClub: Club = await this.clubModel.findById(id);

    if (currentClub) {
      await checkAccess(currentClub.author, req.user);
    }

    if (!currentClub) {
      throw new HttpException('Club not found', HttpStatus.NOT_FOUND);
    }

    const updateData: IUpdateData = {
      title: dto.title,
      description: dto.description,
      info: dto.info,
      author: dto.author,
      updatedAt: isoString,
    };
    const imagePath = path.resolve(
      __dirname,
      '..',
      'static',
      currentClub.picture,
    );

    try {
      const existPicture: string = fs.readFileSync(imagePath).toString('hex');
      const newPicture: string = picture.buffer.toString('hex');

      if (existPicture !== newPicture) {
        const picturePath: string = this.fileService.createFile(
          FileType.IMAGE,
          picture,
        );
        this.fileService.removeFile(currentClub.picture);
        updateData.picture = picturePath;
      }
    } catch (error) {
      updateData.picture = this.fileService.createFile(FileType.IMAGE, picture);
    }
    return this.clubModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }
  async getAll(count = 10, offset = 0): Promise<Array<Club>> {
    const clubs = await this.clubModel
      .find()
      .populate('timers')
      .skip(offset)
      .limit(count)
      .exec();
    if (clubs.length === 0) {
      throw new HttpException('Clubs not found', HttpStatus.NOT_FOUND);
    }
    return clubs;
  }

  async getOne(id: ObjectId): Promise<Club> {
    const club = this.clubModel
      .findById(id)
      .populate({
        path: 'comments',
        populate: [
          {
            path: 'subComments',
            model: 'SubComment',
            populate: {
              path: 'answerToUser',
              model: 'User',
            },
          },
          {
            path: 'author',
            model: 'User',
          },
        ],
      })
      .populate('ratings');
    if (!club) {
      throw new HttpException('Comment not found!', HttpStatus.NOT_FOUND);
    }
    return club;
  }

  async delete(id: ObjectId, req: { user: MeDto }): Promise<Club> {
    const club = await this.clubModel.findByIdAndDelete(id);

    if (!club) {
      throw new HttpException('Club not found!', HttpStatus.NOT_FOUND);
    }

    if (club) {
      await checkAccess(club.author, req.user);
    }

    const user = await this.userModel
      .findOneAndUpdate(
        { clubs: club._id },
        { $pull: { clubs: club._id } },
        { new: true },
      )
      .exec();
    await this.commentService.deleteCommentByClubId(id);
    if (user) {
      return club;
    } else {
      throw new HttpException(
        'User not found!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async view(id: ObjectId): Promise<void> {
    const club = await this.clubModel.findById(id);
    if (!club) {
      throw new HttpException('Club not found', HttpStatus.NOT_FOUND);
    }
    club.views += 1;
    club.save();
  }

  async search(title: string): Promise<Array<Club>> {
    const clubs = await this.clubModel.find({
      title: { $regex: new RegExp(title, 'i') },
    });

    if (clubs.length === 0) {
      throw new HttpException('Clubs not found', HttpStatus.NOT_FOUND);
    }
    if (title) {
      return clubs;
    }
  }
}
