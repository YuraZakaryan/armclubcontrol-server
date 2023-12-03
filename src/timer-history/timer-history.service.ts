import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTimerHistoryDto } from './dto/create-timer-history.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Club } from '../club/club.schema';
import { TimerHistory } from './timer-history.schema';
import { COUNT_HISTORY_TO_KEEP } from '../constants';

@Injectable()
export class TimerHistoryService {
  constructor(
    @InjectModel(Club.name) private clubModel: Model<Club>,
    @InjectModel(TimerHistory.name)
    private timerHistoryModel: Model<TimerHistory>,
  ) {}
  async createTimerHistory(dto: CreateTimerHistoryDto) {
    const club = await this.clubModel.findById(dto.club);
    if (!club) {
      throw new HttpException('Club not found!', HttpStatus.NOT_FOUND);
    }
    const history = await this.timerHistoryModel.create(dto);
    club.timerHistories.push(history._id);
    await club.save();

    return history;
  }
  async removeTimerHistory(club: Types.ObjectId) {
    if (club) {
      const allHistory = await this.timerHistoryModel
        .find({ club })
        .sort({ timestamp: 1 });

      const historyToKeep = allHistory.slice(-COUNT_HISTORY_TO_KEEP);

      const historyToRemoveIds = allHistory
        .filter((history) => !historyToKeep.includes(history))
        .map((history) => history._id);

      await this.timerHistoryModel.deleteMany({
        _id: { $in: historyToRemoveIds },
      });

      const existedClub = await this.clubModel.findById(club);

      const historyToRemoveObjectIds = historyToRemoveIds.map(
        (id) => new Types.ObjectId(id),
      );

      existedClub.timerHistories = existedClub.timerHistories.filter(
        (historyId) =>
          !historyToRemoveObjectIds.some((id) => id.equals(historyId)),
      );

      await existedClub.save();
    }
  }
}
