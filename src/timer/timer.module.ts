import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebsocketService } from 'src/websocket/websocket.service';
import { Club, ClubSchema } from '../club/club.schema';
import {
  TimerHistory,
  TimerHistorySchema,
} from '../timer-history/timer-history.schema';
import { TimerHistoryService } from '../timer-history/timer-history.service';
import { TimerController } from './timer.controller';
import { TimerGateway } from './timer.gateway';
import { Timer, TimerSchema } from './timer.schema';
import { TimerService } from './timer.service';

@Module({
  providers: [
    TimerService,
    TimerHistoryService,
    WebsocketService,
    TimerGateway,
  ],
  controllers: [TimerController],
  imports: [
    MongooseModule.forFeature([
      { name: Timer.name, schema: TimerSchema },
      { name: Club.name, schema: ClubSchema },
      { name: TimerHistory.name, schema: TimerHistorySchema },
    ]),
  ],
})
export class TimerModule {}
