import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TimerDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Timer {
  @Prop()
  title: string;

  @Prop()
  remainingTime: string | null;

  @Prop({ default: false })
  isInfinite: boolean | null;

  @Prop()
  start: string | null;

  @Prop()
  end: string | null;

  @Prop({ type: [String], default: [] })
  playTimestamps: string[];

  @Prop()
  pausedEndTime: string | null;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: false })
  paused: boolean | null;

  @Prop()
  price: number | null;

  @Prop()
  pricePerHour: number;

  @Prop({ default: 0 })
  waitingCount: number;

  @Prop()
  @Prop()
  defineTime: string;

  @Prop({ default: false })
  expired: boolean;

  @Prop({ default: false })
  manuallyStopped: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Club' })
  club: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: Types.ObjectId;
}

export const TimerSchema = SchemaFactory.createForClass(Timer);
