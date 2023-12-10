import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { FileService } from '../file/file.service';
import { CommentService } from '../comment/comment.service';
import { Comment, CommentSchema } from '../comment/schemas/comment.schema';
import {
  SubComment,
  SubCommentSchema,
} from '../comment/schemas/subcomment.schema';
import { Club, ClubSchema } from './club.schema';
import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import {
  TimerHistory,
  TimerHistorySchema,
} from '../timer-history/timer-history.schema';
import { TimerService } from '../timer/timer.service';
import { Timer, TimerSchema } from '../timer/timer.schema';
import { TimerHistoryService } from '../timer-history/timer-history.service';

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
  ],
  exports: [MongooseModule],
})
export class ClubModule {}
