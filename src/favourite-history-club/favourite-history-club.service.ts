import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MeDto } from '../auth/dto/me-dto';
import { Club } from '../club/club.schema';
import { FindOneParams, TResponseMessage } from '../types';
import { User } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { FavouriteClub } from './schema/favourite.schema';
import { HistoryClub } from './schema/history-club.schema';

@Injectable()
export class FavouriteAndLastVisitedService {
  constructor(
    @InjectModel(FavouriteClub.name)
    private favouriteClubModel: Model<FavouriteClub>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(HistoryClub.name)
    private historyClubModel: Model<HistoryClub>,
    @InjectModel(Club.name)
    private clubModel: Model<Club>,
    private userService: UserService,
  ) {}
  async manageFavourite(
    dto: FindOneParams,
    req: { user: MeDto },
  ): Promise<TResponseMessage> {
    const userId = req.user.sub;
    const { id: clubId } = dto;

    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const club = await this.clubModel.findById(clubId);

    if (!club) {
      throw new HttpException('Club not found', HttpStatus.NOT_FOUND);
    }

    const favouriteClub = await this.favouriteClubModel.findOne({
      user: userId,
    });

    if (!favouriteClub) {
      await this.favouriteClubModel.create({
        user: userId,
        clubs: [clubId],
      });
      user.favourites.push(clubId);
      await user.save();
      return { status: 'Success', message: 'Club added to favorites' };
    } else {
      const index: number = favouriteClub.clubs.indexOf(clubId);
      if (index !== -1) {
        favouriteClub.clubs.splice(index, 1);
        await favouriteClub.save();

        const favouriteIndex = user.favourites.indexOf(clubId);

        if (favouriteIndex !== -1) {
          user.favourites.splice(favouriteIndex, 1);
          await user.save();
        }
        return { status: 'Success', message: 'Club deleted from favorites' };
      } else {
        favouriteClub.clubs.unshift(clubId);
        await favouriteClub.save();

        user.favourites.push(clubId);
        await user.save();
        return { status: 'Success', message: 'Club added to favorites' };
      }
    }
  }

  async manageHistory(
    dto: FindOneParams,
    req: { user: MeDto },
  ): Promise<TResponseMessage> {
    const userId = req.user.sub;
    const { id: clubId } = dto;

    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const club = await this.clubModel.findById(clubId);

    if (!club) {
      throw new HttpException('Club not found', HttpStatus.NOT_FOUND);
    }

    const historyClub = await this.historyClubModel.findOne({
      user: userId,
    });

    if (!historyClub) {
      await this.historyClubModel.create({
        user: userId,
        clubs: [clubId],
      });
      return { status: 'Success', message: 'Club added to history' };
    } else {
      const clubIndex = historyClub.clubs.indexOf(clubId);
      if (clubIndex !== -1) {
        historyClub.clubs.splice(clubIndex, 1);
      }
      historyClub.clubs.unshift(clubId);

      if (historyClub.clubs.length > 20) {
        historyClub.clubs.pop();
      }

      await historyClub.save();
      return { status: 'Success', message: 'Club added to history' };
    }
  }
  async getFavouriteClubsByUserId(
    req: {
      user: MeDto;
    },
    limit: number,
    skip: number,
  ) {
    const userId = req.user.sub;

    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const favorites = await this.favouriteClubModel
      .findOne({ user: userId })
      .populate({
        path: 'clubs',
        model: 'Club',
        populate: [
          {
            path: 'timers',
            model: 'Timer',
          },
          {
            path: 'ratings',
            model: 'Rating',
          },
          {
            path: 'comments',
            model: 'Comment',
          },
        ],
      })
      .exec();

    if (!favorites) {
      throw new HttpException(
        'Favourite clubs by this user are not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const totalItems: number = favorites.clubs.length;
    const clubs = favorites.clubs.slice(skip, skip + limit);
    return { items: clubs, totalItems };
  }

  async getClubHistoriesByUserId(
    req: { user: MeDto },
    limit: number,
    skip: number,
  ) {
    const userId = req.user.sub;

    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const history = await this.historyClubModel
      .findOne({ user: userId })
      .populate({
        path: 'clubs',
        model: 'Club',
        populate: [
          {
            path: 'timers',
            model: 'Timer',
          },
          {
            path: 'ratings',
            model: 'Rating',
          },
          {
            path: 'comments',
            model: 'Comment',
          },
        ],
      })
      .exec();

    if (!history) {
      throw new HttpException(
        'History clubs by this user are not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const totalItems: number = history.clubs.length;
    const clubs = history.clubs.slice(skip, skip + limit);
    return { items: clubs, totalItems };
  }
}
