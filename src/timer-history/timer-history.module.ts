import { Module } from '@nestjs/common';
import { TimerHistoryController } from './timer-history.controller';
import { TimerHistoryService } from './timer-history.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Club, ClubSchema } from '../club/club.schema';
import { TimerHistory, TimerHistorySchema } from './timer-history.schema';

@Module({
  controllers: [TimerHistoryController],
  providers: [TimerHistoryService],
  imports: [
    MongooseModule.forFeature([{ name: Club.name, schema: ClubSchema }]),
    MongooseModule.forFeature([
      { name: TimerHistory.name, schema: TimerHistorySchema },
    ]),
  ],
})
export class TimerHistoryModule {}
