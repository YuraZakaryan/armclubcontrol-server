import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { WebsocketService } from 'src/websocket/websocket.service';

interface ICustomTicket extends Socket {
  timerInterval?: NodeJS.Timeout;
}

@Injectable()
@WebSocketGateway({ cors: true })
export class TimerGateway implements OnModuleInit {
  constructor(private websocketService: WebsocketService) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', async (socket: ICustomTicket) => {
      console.log(`User with ${socket.id} id is connected!`);

      socket.on('disconnect', () => {
        console.log(`User with ${socket.id} id is disconnected!`);
        if (socket.timerInterval) {
          clearInterval(socket.timerInterval);
        }
      });

      const club: string | string[] = socket.handshake.query.club;
      await this.getTimers(socket, club);
    });
  }

  private async getTimers(socket: ICustomTicket, club: string | string[]) {
    socket.timerInterval = setInterval(async () => {
      try {
        const clubId = Array.isArray(club) ? club[0] : club;
        const timers = await this.websocketService.getTimersByClubId(
          new Types.ObjectId(clubId),
        );
        socket.emit('timer-updated', JSON.stringify(timers));
      } catch (error) {
        console.error('Error while fetching timer data:', error);
      }
    }, 1000);
    // try {
    //   const clubId = Array.isArray(club) ? club[0] : club;
    //   const timers = await this.websocketService.getTimersByClubId(
    //     new Types.ObjectId(clubId),
    //   );

    //   if (timers) {
    //     socket.emit('timer-updated', JSON.stringify(timers));
    //   }
    // } catch (error) {
    //   console.error('Error while fetching timer data:', error);
    // }
    // socket.timerInterval = setInterval(async () => {
    //   try {
    // const clubId = Array.isArray(club) ? club[0] : club;
    // const data = await this.timerService.getOne(new Types.ObjectId(clubId));
    // socket.emit('timer-updated', JSON.stringify(data));
    //   } catch (error) {
    //     console.error('Error while fetching timer data:', error);
    //   }
    // }, 1000);
  }
}
