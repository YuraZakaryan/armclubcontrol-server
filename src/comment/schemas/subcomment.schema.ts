import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SubCommentDocument = HydratedDocument<SubComment>;

@Schema({ timestamps: true })
export class SubComment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' })
  mainComment: Types.ObjectId;

  @Prop()
  text: string;

  @Prop()
  like: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  usersWhoLiked: Array<Types.ObjectId>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  answerToUser: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'File' })
  club: Types.ObjectId;

  @Prop()
  status: false;
}

export const SubCommentSchema = SchemaFactory.createForClass(SubComment);
