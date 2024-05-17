import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisStore } from 'cache-manager-redis-store';
import { Response } from 'express';
import { Model, Types } from 'mongoose';
import { MeDto } from '../auth/dto/me-dto';
import { Club } from '../club/club.schema';
import { checkAccess } from '../logic';
import { TimerHistoryService } from '../timer-history/timer-history.service';
import { FindOneParams, TMessage } from '../types';
import { getFormattedDate, minutesToTime, timeToMinutes } from '../utils';
import { CreateTimerDto } from './dto/create-timer.dto';
import { StartTimerDto } from './dto/start-timer.dto';
import { UpdateTimerInfoDto } from './dto/update-timer-info.dto';
import { UpdateTimerDto } from './dto/update-timer.dto';
import { TimerGateway } from './timer.gateway';
import { Timer } from './timer.schema';

@Injectable()
export class TimerService {
  private readonly redisStore!: RedisStore;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectModel(Timer.name) private timerModel: Model<Timer>,
    @InjectModel(Club.name) private clubModel: Model<Club>,
    private timerHistoryService: TimerHistoryService,
    private timerGateway: TimerGateway,
  ) {
    this.redisStore = cache.store as unknown as RedisStore;
    this.listenForKeyExpiry();
  }

  private async listenForKeyExpiry() {
    const redisClient = this.redisStore.getClient();
    redisClient.on('expired', (key: string) => {
      console.log(`Key expired: ${key}`);
      // Здесь вы можете выполнить дополнительные действия, например, запросить таймер из базы данных и напечатать его информацию в консоли
    });
  }

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
    const savedClub = await club.save();

    if (savedClub) {
      await this.emitTimerUpdate(club._id);
    }

    res.status(HttpStatus.CREATED);

    return timer;
  }

  async updateInfo(
    params: FindOneParams,
    dto: UpdateTimerInfoDto,
    req: { user: MeDto },
  ): Promise<void> {
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

    timer.waitingCount = dto.waitingCount;
    timer.price = dto.price;

    if (dto.isInfinite && dto.price) {
      timer.price = dto.price;

      if (!timer.isInfinite) {
        timer.isInfinite = true;
      }

      if (!timer.isActive) {
        timer.pricePerHour = 0;
        timer.remainingTime = '00:00';
        timer.defineTime = null;
        timer.isActive = false;
        timer.paused = false;
      }
    } else if (
      !dto.isInfinite &&
      dto.remainingTime !== '00:00' &&
      dto.price > 0
    ) {
      if (timer.isInfinite) {
        timer.isInfinite = false;
      }

      if (
        timer.remainingTime &&
        timer.remainingTime !== '00:00' &&
        timer.isActive &&
        dto.remainingTime >= timer.remainingTime
      ) {
        // Convert timer.defineTime and dto.remainingTime to minutes
        const defineTimeInMinutes: number = timeToMinutes(timer.defineTime);
        const dtoRemainingTimeInMinutes: number = timeToMinutes(
          dto.remainingTime,
        );

        // Calculate the difference between dto.remainingTime and timer.defineTime
        const differenceInMinutes: number =
          dtoRemainingTimeInMinutes - defineTimeInMinutes;

        // Convert timer.remainingTime to minutes and calculate the new time in minutes
        const currentTimeInMinutes: number = timeToMinutes(timer.remainingTime);
        const newTimeInMinutes: number =
          currentTimeInMinutes + differenceInMinutes;

        // Update timer properties
        timer.defineTime = dto.remainingTime;
        timer.remainingTime = minutesToTime(newTimeInMinutes);
      } else {
        timer.remainingTime = dto.remainingTime;
        timer.defineTime = dto.remainingTime;
        timer.pricePerHour = 0;
        timer.isActive = false;
        timer.paused = false;
      }
    }

    const savedTimer = await timer.save();

    if (savedTimer) {
      await this.emitTimerUpdate(savedTimer.club._id);
    }

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
    await this.scheduleClearTimer(timer._id);

    // if (!timer.expired) {
    //   // timer.end = this.calculateEndTime(
    //   //   timer.start,
    //   //   timer.remainingTime + ':00',
    //   // );
    //   timer.expired = true;
    //   timer.manuallyStopped = true;

    //   await timer.save();

    //   await this.scheduleClearTimer(timer._id);

    //   await this.emitTimerUpdate(timer.club._id);
    // }
    // if (timer.expired && timer.manuallyStopped) {
    //   await this.createTimerHistoryByClub(timer);
    //   await this.timerHistoryService.removeTimerHistory(timer.club);
    // }
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

    const startTime: string = getFormattedDate(new Date());

    if (startTime) {
      const client = this.redisStore.getClient();
      await client.HSET(timer.title, String(timer._id), JSON.stringify(timer));
      await client.PEXPIRE(timer.title, 10000);
    }

    timer.isActive = true;
    // timer.start = startTime;
    if (!timer.isInfinite) {
      timer.end = this.calculateEndTime(dto.start, timer.remainingTime + ':00');
    }
    const savedTimer = await timer.save();
    if (savedTimer) {
      await this.emitTimerUpdate(timer.club);
    }
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
    const savedTimer = await timer.save();

    if (savedTimer) {
      await this.emitTimerUpdate(timer.club);
    }

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
          await this.createTimerHistoryByClub(timer);
          this.scheduleClearTimer(timer._id);
        }
        await timer.save();
      }
    }
    await this.timerHistoryService.removeTimerHistory(timers[0]?.club);
  }
  scheduleClearTimer(timerId: Types.ObjectId): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        await this.clear(timerId);
        resolve(); // Resolve the promise after clearing the timer
      }, 1000);
    });
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

  async getOne(id: Types.ObjectId): Promise<Timer[]> {
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

  async emitTimerUpdate(clubId: Types.ObjectId): Promise<void> {
    const timers = await this.getOne(clubId);

    const clubIdStringify = clubId.toString();

    const sockets = await this.timerGateway.server.fetchSockets();

    for (const socket of sockets) {
      const socketClub = socket.handshake.query.club;
      if (
        Array.isArray(socketClub)
          ? socketClub[0] === clubIdStringify
          : socketClub === clubIdStringify
      ) {
        this.timerGateway.server
          .to(socket.id)
          .emit('timer-updated', JSON.stringify(timers));
      }
    }
  }
}
