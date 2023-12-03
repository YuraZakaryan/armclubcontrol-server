import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TimerHistoryDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class TimerHistory {
  @Prop()
  title: string;

  @Prop()
  time: string;

  @Prop()
  start: string;

  @Prop()
  end: string;

  @Prop()
  price: number;

  @Prop()
  finalPrice: number;

  @Prop({ default: false })
  isInfinite: boolean;

  @Prop({ default: false })
  manuallyStopped: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Club' })
  club: Types.ObjectId;
}

export const TimerHistorySchema = SchemaFactory.createForClass(TimerHistory);
