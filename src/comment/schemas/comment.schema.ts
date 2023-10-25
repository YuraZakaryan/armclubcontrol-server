import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SubComment } from './subcomment.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: Types.ObjectId;

  @Prop()
  text: string;

  @Prop()
  like: number;

  @Prop()
  dislike: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubComment' }] })
  subComments: Array<SubComment>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'File' })
  club: Types.ObjectId;

  @Prop()
  status: false;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
