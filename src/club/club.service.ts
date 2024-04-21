import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model, Types } from 'mongoose';
import { Rating } from 'src/rating/rating.schema';
import { RatingService } from 'src/rating/rating.service';
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
    @InjectModel(Club.name)
    private ratingModel: Model<Rating>,
    private fileService: FileService,
    private ratingService: RatingService,
    private commentService: CommentService,
    private timerService: TimerService,
  ) {}

  async create(
    dto: CreateClubDto,
    picture: Express.Multer.File,
    posterPicture: Express.Multer.File,
    res: Response,
  ): Promise<Club> {
    const picturePath = await this.fileService.createFile(
      FileType.IMAGE,
      picture,
    );

    let posterPicturePath: string | null = null;

    if (posterPicture) {
      posterPicturePath = await this.fileService.createFile(
        FileType.IMAGE,
        posterPicture,
      );
    }
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
      posterPicture: posterPicturePath,
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
    posterPicture: Express.Multer.File,
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
    if (posterPicture) {
      try {
        if (currentClub.posterPicture) {
          this.fileService.removeFile(currentClub.posterPicture);
        }
        if (posterPicture.buffer) {
          const posterPicturePath: string = await this.fileService.createFile(
            FileType.IMAGE,
            posterPicture,
          );
          updateData.posterPicture = posterPicturePath;
        }
      } catch (error) {
        updateData.picture = await this.fileService.createFile(
          FileType.IMAGE,
          picture,
        );
      }
    }
    if (dto.removePosterPicture) {
      if (currentClub.posterPicture) {
        this.fileService.removeFile(currentClub.posterPicture);
        updateData.posterPicture = null;
      }
    }
    return this.clubModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }
  async getAll(
    limit: number,
    skip: number,
    region: string,
    city: string,
    title: string,
    random: boolean,
    byRating: boolean,
  ) {
    const queryConditions: any = {};

    if (region !== undefined) {
      queryConditions.region = region;
    }

    if (city !== undefined) {
      queryConditions.city = city;
    }

    if (title !== undefined) {
      queryConditions.title = { $regex: new RegExp(title, 'i') };
    }

    let query: any = this.clubModel.find(queryConditions);

    if (random) {
    } else if (byRating) {
      query = query.sort({});
    } else {
      query = query.sort({ _id: -1 });
    }
    const totalItemsQuery = this.clubModel.find(queryConditions);
    const totalItems = await totalItemsQuery.countDocuments().exec();

    const clubs = await query
      .limit(limit)
      .skip(skip)
      .populate('timers ratings comments')
      .exec();

    if (!clubs || clubs.length === 0) {
      throw new HttpException('Clubs not found', HttpStatus.NOT_FOUND);
    }

    if (byRating) {
      return this.sortClubsByRatingAndHandleErrors(clubs, totalItems);
    }

    return {
      totalItems: totalItems,
      items: clubs,
    };
  }

  async sortClubsByRatingAndHandleErrors(clubs: any[], totalItems: number) {
    const ratingPromises = clubs.map(async (club: any) => {
      try {
        const averageRating = await this.ratingService.getAverageByClubId(
          club._id,
        );
        return { club, averageRating };
      } catch (error) {
        return { club, error };
      }
    });

    const ratingResults = await Promise.all(ratingPromises);
    const successfulClubs = [];
    const errorClubs = [];

    ratingResults.forEach((item) => {
      if (item.error) {
        errorClubs.push(item);
      } else {
        successfulClubs.push(item);
      }
    });

    successfulClubs.sort((a: any, b: any) => {
      if (a.averageRating === b.averageRating) {
        return Math.random() - 0.5;
      }
      return b.averageRating - a.averageRating;
    });

    const finalClubs = successfulClubs
      .map((item) => item.club)
      .concat(errorClubs.map((item) => item.club));

    return {
      totalItems: totalItems,
      items: finalClubs,
    };
  }

  async getOne(id: Types.ObjectId): Promise<Club> {
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

  async view(id: Types.ObjectId): Promise<void> {
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
