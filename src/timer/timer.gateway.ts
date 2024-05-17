import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { WebsocketService } from 'src/websocket/websocket.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import Redis from 'ioredis';

interface ICustomTicket extends Socket {
  timerInterval?: NodeJS.Timeout;
}

@Injectable()
@WebSocketGateway({ cors: true })
export class TimerGateway implements OnModuleInit {
  private readonly redisSubscriber: Redis;
  private readonly redisClient: Redis;

  constructor(
    private websocketService: WebsocketService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    this.redisSubscriber = new Redis();
    this.redisClient = new Redis();

    this.redisSubscriber.psubscribe('__keyevent@0__:expired');
    this.setupRedisEventHandlers();
  }

  private setupRedisEventHandlers() {
    this.redisSubscriber.on(
      'pmessage',
      async (pattern, channel, expiredKey) => {
        const expiredValue = await this.redisClient.get(expiredKey);
        console.log(`Value of expired key ${expiredKey}:`, expiredValue);
      },
    );

    this.redisSubscriber.on('error', (error) => {
      console.error('Redis error:', error);
    });
  }

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
