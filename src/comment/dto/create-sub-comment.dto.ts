import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubCommentDto {
  @ApiProperty({ example: '64e5b1be8d6a60e8c6931f16', description: 'user' })
  user: Types.ObjectId;
  @ApiProperty({
    example: '64e5c02338afc81fec5d79fd',
    description: 'mainComment',
  })
  mainComment: Types.ObjectId;
  @ApiProperty({
    example: '64e5c02338afc81fec5d79fd',
    description: 'commentId',
  })
  replyToComment: Types.ObjectId;
  @ApiProperty({ example: "That's cool", description: 'text' })
  text: string;
  @ApiProperty({
    example: '64e5b1be8d6a60e8c6931f16',
    description: 'answerToUser',
  })
  answerToUser: Types.ObjectId;
}
