import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Club, ClubSchema } from '../club/club.schema';
import { TimerHistoryController } from './timer-history.controller';
import { TimerHistory, TimerHistorySchema } from './timer-history.schema';
import { TimerHistoryService } from './timer-history.service';

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
