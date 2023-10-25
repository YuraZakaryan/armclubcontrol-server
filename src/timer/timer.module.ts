import { Module } from '@nestjs/common';
import { TimerController } from './timer.controller';
import { TimerService } from './timer.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Timer, TimerSchema } from './timer.schema';
import { Club, ClubSchema } from '../club/club.schema';
import { TimerGateway } from './timer.gateway';
import { Server } from 'socket.io';

@Module({
  providers: [TimerService, TimerGateway, Server],
  controllers: [TimerController],
  imports: [
    MongooseModule.forFeature([
      { name: Timer.name, schema: TimerSchema },
      { name: Club.name, schema: ClubSchema },
    ]),
  ],
})
export class TimerModule {}
