import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { CommentController } from './comment.controller';
import { SubComment, SubCommentSchema } from './schemas/subcomment.schema';
import { Club, ClubSchema } from '../club/club.schema';
import { User, UserSchema } from '../user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Club.name, schema: ClubSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: SubComment.name, schema: SubCommentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
