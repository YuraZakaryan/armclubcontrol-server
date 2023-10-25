import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTimerPriceDto } from './dto/create-timer-price.dto';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { TimerPrice } from './timer-price.schema';
import { Model, Types } from 'mongoose';
import { Club } from '../club/club.schema';
import { Rating } from '../rating/rating.schema';
import { checkAccess } from '../logic';
import { MeDto } from '../auth/dto/me-dto';
import { UpdateTimerPriceDto } from './dto/update-timer-price.dto';

@Injectable()
export class TimerPriceService {
  constructor(
    @InjectModel(TimerPrice.name) private timerPriceModel: Model<TimerPrice>,
    @InjectModel(Club.name) private clubModel: Model<Club>,
  ) {}
  async create(dto: CreateTimerPriceDto, res: Response): Promise<TimerPrice> {
    const club = await this.clubModel.findById(dto.club);

    if (!club) {
      throw new HttpException('Club not found!', HttpStatus.NOT_FOUND);
    }

    const existedPrice = await this.timerPriceModel.findOne({
      title: dto.title,
      price: dto.price,
      club: dto.club,
    });

    if (existedPrice) {
      throw new HttpException(
        'Price with this title, price and club already exists',
        HttpStatus.FORBIDDEN,
      );
    }

    const price = await this.timerPriceModel.create(dto);
    club.prices.push(price._id);
    await club.save();

    res.status(HttpStatus.CREATED);

    return price;
  }

  async delete(
    id: Types.ObjectId,
    req: { user: MeDto },
  ): Promise<{ price: TimerPrice; message: string }> {
    const price = await this.timerPriceModel.findByIdAndDelete(id);

    if (!price) {
      throw new HttpException('Price not found!', HttpStatus.NOT_FOUND);
    }

    await checkAccess(price.author, req.user);

    const club = await this.clubModel
      .findOneAndUpdate(
        { prices: price._id },
        { $pull: { prices: price._id } },
        { new: true },
      )
      .exec();

    if (club) {
      return {
        price,
        message: `Price ${price.title}, successfully deleted!`,
      };
    } else {
      throw new HttpException(
        'Club not found!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: Types.ObjectId,
    dto: UpdateTimerPriceDto,
    req: { user: MeDto },
  ) {
    const price = await this.timerPriceModel.findById(id);

    if (!price) {
      throw new HttpException('Price not found', HttpStatus.NOT_FOUND);
    }

    await checkAccess(price.author, req.user);
    price.title = dto.title;
    price.price = dto.price;
    await price.save();

    return price;
  }
}
