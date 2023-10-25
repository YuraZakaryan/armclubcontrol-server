import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TimerDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Timer {
  @Prop()
  title: string;

  @Prop()
  remainingTime: string | null;

  @Prop()
  isInfinite: boolean | null;

  @Prop()
  start: string | null;

  @Prop()
  end: string | null;

  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  paused: boolean | null;

  @Prop()
  price: number | null;

  @Prop()
  pricePerHour: number;

  @Prop()
  defineTime: string;

  @Prop()
  expired: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Club' })
  club: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: Types.ObjectId;
}

export const TimerSchema = SchemaFactory.createForClass(Timer);
