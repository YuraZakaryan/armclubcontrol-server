import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model, ObjectId, Types } from 'mongoose';
import { MeDto } from '../auth/dto/me-dto';
import { CommentService } from '../comment/comment.service';
import { FileService, FileType } from '../file/file.service';
import { checkAccess } from '../logic';
import { TimerService } from '../timer/timer.service';
import { FindOneParams, IUpdateData } from '../types';
import { User } from '../user/user.schema';
import { Club } from './club.schema';
import { CreateClubDto } from './dto/create-club.dto';

@Injectable()
export class ClubService {
  constructor(
    @InjectModel(Club.name)
    private clubModel: Model<Club>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private fileService: FileService,
    private commentService: CommentService,
    private timerService: TimerService,
  ) {}

  async create(
    dto: CreateClubDto,
    picture: Express.Multer.File,
    res: Response,
  ): Promise<Club> {
    const picturePath = await this.fileService.createFile(
      FileType.IMAGE,
      picture,
    );
    const user = await this.userModel.findById(dto.author);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (!user.activated) {
      throw new HttpException('Profile is not activated', HttpStatus.NOT_FOUND);
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
    const id: Types.ObjectId = params.id;
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
      phone: dto.phone,
      region: dto.region,
      city: dto.city,
      address: dto.address,
      latitudeMap: dto.latitudeMap,
      longitudeMap: dto.longitudeMap,
      closingTime: dto.closingTime,
      openingTime: dto.openingTime,
      updatedAt: isoString,
      author: dto.author,
    };
    if (picture) {
      try {
        this.fileService.removeFile(currentClub.picture);
        const picturePath: string = await this.fileService.createFile(
          FileType.IMAGE,
          picture,
        );
        this.fileService.removeFile(currentClub.picture);
        updateData.picture = picturePath;
      } catch (error) {
        updateData.picture = await this.fileService.createFile(
          FileType.IMAGE,
          picture,
        );
      }
    }
    return this.clubModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }
  async getAll(count = 10, offset = 0): Promise<Array<Club>> {
    const clubs = await this.clubModel
      .find()
      .populate('timers ratings comments')
      .skip(offset)
      .limit(count)
      .exec();
    if (clubs.length === 0) {
      throw new HttpException('Clubs not found', HttpStatus.NOT_FOUND);
    }
    return clubs;
  }

  async getOne(id: ObjectId): Promise<Club> {
    const club = await this.clubModel
      .findById(id)
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: [
          {
            path: 'subComments',
            model: 'SubComment',
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
        path: 'timerHistories',
        options: { sort: { createdAt: -1 } },
      })
      .populate('ratings timers author')
      .exec();
    if (!club) {
      throw new HttpException('Clubs not found!', HttpStatus.NOT_FOUND);
    }
    return club;
  }

  async getByUserId(
    params: FindOneParams,
    req: { user: MeDto },
  ): Promise<Array<Club>> {
    const userId = params.id;

    const clubs = await this.clubModel
      .find({ author: userId })
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: [
          {
            path: 'subComments',
            model: 'SubComment',
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
        path: 'timerHistories',
        options: { sort: { createdAt: -1 } },
      })
      .populate('ratings timers author')
      .exec();

    if (!clubs || clubs.length === 0) {
      throw new HttpException('Clubs not found!', HttpStatus.NOT_FOUND);
    }

    for (const club of clubs) {
      await checkAccess(club.author._id, req.user);
    }

    return clubs;
  }

  async delete(params: FindOneParams, req: { user: MeDto }): Promise<Club> {
    const id = params.id;
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
    await this.timerService.deleteTimersByClubId(id);
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
