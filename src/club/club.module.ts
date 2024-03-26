import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimerGateway } from 'src/timer/timer.gateway';
import { WebsocketService } from 'src/websocket/websocket.service';
import { CommentService } from '../comment/comment.service';
import { Comment, CommentSchema } from '../comment/schemas/comment.schema';
import {
  SubComment,
  SubCommentSchema,
} from '../comment/schemas/subcomment.schema';
import { FileService } from '../file/file.service';
import {
  TimerHistory,
  TimerHistorySchema,
} from '../timer-history/timer-history.schema';
import { TimerHistoryService } from '../timer-history/timer-history.service';
import { Timer, TimerSchema } from '../timer/timer.schema';
import { TimerService } from '../timer/timer.service';
import { User, UserSchema } from '../user/user.schema';
import { ClubController } from './club.controller';
import { Club, ClubSchema } from './club.schema';
import { ClubService } from './club.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Club.name, schema: ClubSchema },
      { name: User.name, schema: UserSchema },
      { name: Timer.name, schema: TimerSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: SubComment.name, schema: SubCommentSchema },
      { name: TimerHistory.name, schema: TimerHistorySchema },
    ]),
  ],
  controllers: [ClubController],
  providers: [
    ClubService,
    FileService,
    CommentService,
    TimerService,
    TimerHistoryService,
    TimerGateway,
    WebsocketService,
  ],
  exports: [MongooseModule],
})
export class ClubModule {}
