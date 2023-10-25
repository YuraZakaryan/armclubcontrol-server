import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TimerPriceDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class TimerPrice {
  @Prop()
  title: string;

  @Prop()
  price: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Club' })
  club: Types.ObjectId;

  @Prop()
  author: Types.ObjectId;
}

export const TimerPriceSchema = SchemaFactory.createForClass(TimerPrice);
