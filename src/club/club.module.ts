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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Club.name, schema: ClubSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: SubComment.name, schema: SubCommentSchema },
    ]),
  ],
  controllers: [ClubController],
  providers: [ClubService, FileService, CommentService],
  exports: [MongooseModule],
})
export class ClubModule {}
