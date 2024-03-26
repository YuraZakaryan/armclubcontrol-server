import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Timer } from 'src/timer/timer.schema';

@Injectable()
export class WebsocketService {
  constructor(@InjectModel(Timer.name) private timerModel: Model<Timer>) {}

  async getTimersByClubId(id: Types.ObjectId): Promise<Timer[]> {
    return await this.timerModel.find({ club: id });
  }
}
