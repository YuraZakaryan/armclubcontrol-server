import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTimerDto } from './dto/create-timer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Timer } from './timer.schema';
import { Model, Types } from 'mongoose';
import { Club } from '../club/club.schema';
import { Response } from 'express';
import { UpdateTimerDto } from './dto/update-timer.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FindOneParams, TMessage } from '../types';
import { checkAccess } from '../logic';
import { MeDto } from '../auth/dto/me-dto';
import { StartTimerDto } from './dto/start-timer.dto';
import { TimerHistoryService } from '../timer-history/timer-history.service';
import { UpdateTimerInfoDto } from './dto/update-timer-info.dto';

@Injectable()
export class TimerService {
  constructor(
    @InjectModel(Timer.name) private timerModel: Model<Timer>,
    @InjectModel(Club.name) private clubModel: Model<Club>,
    private timerHistoryService: TimerHistoryService,
  ) {}

  async create(dto: CreateTimerDto, res: Response): Promise<Timer> {
    const club = await this.clubModel.findById(dto.club);

    if (!club) {
      res.status(HttpStatus.NOT_FOUND);
      throw new HttpException('Club not found!', HttpStatus.NOT_FOUND);
    }

    const existingTimer = await this.timerModel.findOne({
      title: dto.title,
      author: club.author,
    });
    if (existingTimer) {
      throw new HttpException(
        'A timer with the same title already exists',
        HttpStatus.FORBIDDEN,
      );
    }

    const timer = await this.timerModel.create({
      ...dto,
      remainingTime: null,
      defineTime: null,
      isInfinite: false,
      paused: false,
      start: null,
      end: null,
      price: null,
      pricePerHour: 0,
      expired: false,
      manuallyStopped: false,
      isActive: false,
    });
    club.timers.push(timer._id);
    await club.save();

    res.status(HttpStatus.CREATED);

    return timer;
  }

  async updateInfo(
    params: FindOneParams,
    dto: UpdateTimerInfoDto,
    req: { user: MeDto },
  ) {
    const id = params.id;

    const timer = await this.timerModel.findById(id);
    if (timer) {
      await checkAccess(timer.author, req.user);
    }
    if (!timer) {
      throw new HttpException('Timer not found!', HttpStatus.NOT_FOUND);
    }
    timer.title = dto.title;
    await timer.save();
  }

  async update(
    id: Types.ObjectId,
    dto: UpdateTimerDto,
    req: { user: MeDto },
  ): Promise<Timer> {
    const timer = await this.timerModel.findById(id);

    if (timer) {
      await checkAccess(timer.author, req.user);
    }

    if (!timer) {
      throw new HttpException('Timer not found!', HttpStatus.NOT_FOUND);
    }

    if (dto.isInfinite) {
      timer.isInfinite = true;
      timer.price = dto.price;

      timer.remainingTime = '00:00';
      timer.pricePerHour = 0;
      timer.isActive = false;
      timer.paused = false;
    } else {
      timer.remainingTime = dto.remainingTime;
      timer.defineTime = dto.remainingTime;
      timer.price = dto.price;
      timer.pricePerHour = 0;
      timer.isInfinite = false;
      timer.isActive = false;
      timer.paused = false;
    }

    await timer.save();

    return timer;
  }

  async stop(id: Types.ObjectId, req?: { user: MeDto }) {
    const timer = await this.timerModel.findById(id);

    if (timer) {
      await checkAccess(timer.author, req.user);
    }

    if (!timer) {
      throw new HttpException('Timer not found', HttpStatus.NOT_FOUND);
    }

    if (!timer.isActive) {
      throw new HttpException('Timer is not active', HttpStatus.FORBIDDEN);
    }

    if (!timer.expired) {
      timer.end = this.calculateEndTime(
        timer.start,
        timer.remainingTime + ':00',
      );
      timer.expired = true;
      timer.manuallyStopped = true;

      await timer.save();

      this.scheduleClearTimer(timer._id);
    }
    if (timer.expired && timer.manuallyStopped) {
      await this.createTimerHistoryByClub(timer);
      await this.timerHistoryService.removeTimerHistory(timer.club);
    }
  }

  async start(id: Types.ObjectId, dto: StartTimerDto, req?: { user: MeDto }) {
    const timer = await this.timerModel.findById(id);
    if (timer) {
      await checkAccess(timer.author, req.user);
    }

    if (timer.isActive) {
      throw new HttpException('Timer is already active', HttpStatus.FORBIDDEN);
    }

    if (!timer) {
      throw new HttpException('Timer not found', HttpStatus.NOT_FOUND);
    }
    timer.isActive = true;
    timer.start = dto.start;
    if (!timer.isInfinite) {
      timer.end = this.calculateEndTime(dto.start, timer.remainingTime + ':00');
    }
    await timer.save();
  }

  async pause(
    id: Types.ObjectId,
    dto: StartTimerDto,
    req: { user: MeDto },
  ): Promise<TMessage> {
    const timer = await this.timerModel.findById(id);

    if (timer) {
      await checkAccess(timer.author, req.user);
    }

    if (!timer) {
      throw new HttpException('Timer not found', HttpStatus.NOT_FOUND);
    }

    if (!timer.isActive) {
      throw new HttpException('Timer is not started', HttpStatus.FORBIDDEN);
    }

    timer.paused = !timer.paused;
    await timer.save();

    if (!timer.isInfinite) {
      if (timer.paused) {
        timer.end = null;
      } else {
        timer.end = this.calculateEndTime(
          dto.start,
          timer.remainingTime + ':00',
        );
      }
    }
    await timer.save();

    return {
      message: `${timer.title} ${timer.paused ? 'paused!' : 'continue'}`,
    };
  }

  @Cron(CronExpression.EVERY_SECOND)
  async updateRemainingTime(): Promise<void> {
    const timers = await this.timerModel.find({
      isActive: true,
      paused: false,
      remainingTime: { $ne: null },
    });

    for (const timer of timers) {
      if (timer.isActive && !timer.expired) {
        if (timer.isInfinite) {
          timer.remainingTime = this.addMinutesToTime(timer.remainingTime, 1);
          timer.pricePerHour += timer.price / 60;
        } else if (timer.remainingTime !== '00:00') {
          timer.remainingTime = this.subtractMinutesFromTime(
            timer.remainingTime,
            1,
          );
          timer.pricePerHour += timer.price / 60;
        } else {
          timer.expired = true;
          this.scheduleClearTimer(timer._id);
        }
        await timer.save();
        await this.createTimerHistoryByClub(timer);
      }
    }
    await this.timerHistoryService.removeTimerHistory(timers[0]?.club);
  }

  scheduleClearTimer(timerId: Types.ObjectId): void {
    setTimeout(async () => {
      await this.clear(timerId);
    }, 1000);
  }

  async createTimerHistoryByClub(timer: any) {
    if (timer.expired) {
      await this.timerHistoryService.createTimerHistory({
        timerId: timer._id,
        title: timer.title,
        time: timer.manuallyStopped ? timer.remainingTime : timer.defineTime,
        isInfinite: timer.isInfinite,
        start: timer.start,
        end: timer.end,
        price: timer.price,
        finalPrice: timer.pricePerHour,
        manuallyStopped: timer.manuallyStopped,
        club: timer.club,
      });
    }
  }

  async clear(id: Types.ObjectId): Promise<Timer> {
    const timer = await this.timerModel.findByIdAndUpdate(id, {
      remainingTime: null,
      isInfinite: false,
      start: null,
      end: null,
      isActive: false,
      paused: false,
      price: null,
      pricePerHour: 0,
      expired: false,
      manuallyStopped: false,
      defineTime: null,
    });
    if (!timer) {
      throw new HttpException('Timer not found', HttpStatus.NOT_FOUND);
    }
    return timer;
  }

  addMinutesToTime(time: string, minutesToAdd: number) {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + minutesToAdd;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(
      2,
      '0',
    )}`;
  }

  subtractMinutesFromTime(time: string, minutesToSubtract: number) {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes - minutesToSubtract;
    if (totalMinutes < 0) {
      return '00:00';
    }
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(
      2,
      '0',
    )}`;
  }

  async getOne(id: Types.ObjectId) {
    return this.timerModel.find({ club: id });
  }

  async delete(params: FindOneParams, res: Response, req: { user: MeDto }) {
    const id = params.id;
    const timer = await this.timerModel.findById(id);

    if (timer) {
      await checkAccess(timer.author, req.user);
    }

    const deletedTimer = await this.timerModel.findByIdAndDelete(id);

    if (!deletedTimer) {
      res.status(HttpStatus.NOT_FOUND);
      throw new HttpException('Timer not found', HttpStatus.NOT_FOUND);
    }

    const club = await this.clubModel
      .findOneAndUpdate(
        { timers: deletedTimer._id },
        { $pull: { timers: deletedTimer._id } },
        { new: true },
      )
      .exec();
    if (club && deletedTimer) {
      return deletedTimer;
    } else {
      throw new HttpException(
        'Club not found!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteTimersByClubId(clubId: Types.ObjectId) {
    const timers = await this.timerModel.deleteMany({ club: { $in: clubId } });
    return timers.deletedCount;
  }

  calculateEndTime(startTime: string, remainingTime: string) {
    const [startHours, startMinutes, startSeconds] = startTime
      .split(':')
      .map(Number);
    const [remainingHours, remainingMinutes, remainingSeconds] = remainingTime
      .split(':')
      .map(Number);
    const startDate = new Date();
    startDate.setHours(startHours);
    startDate.setMinutes(startMinutes);
    startDate.setSeconds(startSeconds);

    const remainingMilliseconds =
      (remainingHours * 3600 + remainingMinutes * 60 + remainingSeconds) * 1000;

    const endDate = new Date(startDate.getTime() + remainingMilliseconds);

    const endHours = endDate.getHours();
    const endMinutes = endDate.getMinutes();
    const endSeconds = endDate.getSeconds();

    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(
      2,
      '0',
    )}:${String(endSeconds).padStart(2, '0')}`;
  }
}
