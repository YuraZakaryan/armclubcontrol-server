import { OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TimerService } from './timer.service';
import { Types } from 'mongoose';
import { CronExpression } from '@nestjs/schedule';
@WebSocketGateway({ cors: true })
export class TimerGateway implements OnModuleInit {
  constructor(private timerService: TimerService) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(`User with ${socket.id} id is connected!`);
      this.startTimer(socket);
    });
  }

  private async startTimer(socket) {
    try {
      const data = await this.timerService.getOne(
        new Types.ObjectId(new Types.ObjectId('6535003d271b55fe84afe08f')),
      );
      socket.emit('timer-updated', JSON.stringify(data));
    } catch (error) {
      console.error('Error while fetching timer data:', error);
    }
    setTimeout(() => this.startTimer(socket), 1000);
  }
}
