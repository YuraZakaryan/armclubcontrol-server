import { OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TimerService } from './timer.service';
import { Types } from 'mongoose';

interface ICustomTicket extends Socket {
  timerInterval?: NodeJS.Timeout;
}

@WebSocketGateway({ cors: true })
export class TimerGateway implements OnModuleInit {
  constructor(private timerService: TimerService) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket: ICustomTicket) => {
      console.log(`User with ${socket.id} id is connected!`);

      socket.on('disconnect', () => {
        console.log(`User with ${socket.id} id is disconnected!`);
        if (socket.timerInterval) {
          clearInterval(socket.timerInterval);
        }
      });

      const club: string | string[] = socket.handshake.query.club;
      this.startTimer(socket, club);
    });
  }

  private startTimer(socket: ICustomTicket, club: string | string[]) {
    socket.timerInterval = setInterval(async () => {
      try {
        const clubId = Array.isArray(club) ? club[0] : club;
        const data = await this.timerService.getOne(new Types.ObjectId(clubId));
        socket.emit('timer-updated', JSON.stringify(data));
      } catch (error) {
        console.error('Error while fetching timer data:', error);
      }
    }, 1000);
  }
}
