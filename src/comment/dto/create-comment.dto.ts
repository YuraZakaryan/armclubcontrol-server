import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: '64e5b1be8d6a60e8c6931f16', description: 'user' })
  readonly user: Types.ObjectId;
  @ApiProperty({ example: "That's cool", description: 'text' })
  readonly text: string;
  @ApiProperty({ example: '64e5b2af47ea789e78e158e0', description: 'club' })
  readonly club: Types.ObjectId;
}
