import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimerGateway } from 'src/timer/timer.gateway';
import { Timer, TimerSchema } from 'src/timer/timer.schema';
import { WebsocketService } from './websocket.service';

@Module({
  providers: [WebsocketService, TimerGateway],
  imports: [
    MongooseModule.forFeature([{ name: Timer.name, schema: TimerSchema }]),
  ],
  exports: [WebsocketService],
})
export class WebsocketModule {}
