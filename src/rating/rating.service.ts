import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SetRatingDto } from './dto/set-rating.dto';
import { Rating } from './rating.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Response } from 'express';
import { Club } from '../club/club.schema';

@Injectable()
export class RatingService {
  constructor(
    @InjectModel(Club.name)
    private clubModel: Model<Club>,
    @InjectModel(Rating.name)
    private ratingModel: Model<Rating>,
  ) {}

  async setRating(dto: SetRatingDto, res: Response) {
    const club = await this.clubModel.findById(dto.club);

    if (!club) {
      throw new HttpException('Club not found!', HttpStatus.NOT_FOUND);
    }

    const existingRating = await this.ratingModel.findOne({
      club: dto.club,
      user: dto.user,
    });

    if (existingRating) {
      return await this.unsetRating(existingRating._id);
    }
    const rating = await this.ratingModel.create(dto);
    club.ratings.push(rating.id);
    await club.save();

    res.status(HttpStatus.CREATED);

    return rating;
  }

  async unsetRating(
    id: Types.ObjectId,
  ): Promise<{ rating: Rating; message: string }> {
    const rating = await this.ratingModel.findByIdAndDelete(id);

    if (!rating) {
      throw new HttpException('Rating not found!', HttpStatus.NOT_FOUND);
    }

    const club = await this.clubModel
      .findOneAndUpdate(
        { ratings: rating._id },
        { $pull: { ratings: rating._id } },
        { new: true },
      )
      .exec();

    if (club) {
      return {
        rating: rating,
        message: `Rating by ${id} id, successfully deleted!`,
      };
    } else {
      throw new HttpException(
        'Club not found!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAll(): Promise<Array<Rating>> {
    const ratings = await this.ratingModel.find();
    if (ratings.length === 0) {
      throw new HttpException('Ratings not found', HttpStatus.NOT_FOUND);
    }
    return ratings;
  }

  async getOne(id: ObjectId): Promise<Rating> {
    const rating = await this.ratingModel.findById(id);
    if (!rating) {
      throw new HttpException('Comment not found!', HttpStatus.NOT_FOUND);
    }
    return rating;
  }

  async getAverageByClubId(id: ObjectId) {
    const ratings = await this.ratingModel.find({ club: id });
    if (ratings.length === 0) {
      throw new HttpException('Ratings not found', HttpStatus.NOT_FOUND);
    }
    const totalRatings = ratings.length;
    const sumOfRatings = ratings.reduce(
      (sum, rating) => sum + rating.rating,
      0,
    );
    return sumOfRatings / totalRatings;
  }
}
