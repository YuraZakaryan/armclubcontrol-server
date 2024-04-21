import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ClubDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Club {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  info: string;

  @Prop()
  region: string;

  @Prop()
  city: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop()
  views: number;

  @Prop()
  picture: string;

  @Prop()
  posterPicture: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pictures' }] })
  pictures: Array<Types.ObjectId>;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] })
  comments: Array<Comment>;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }] })
  ratings: Array<Types.ObjectId>;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TimerHistory' }],
  })
  timerHistories: Array<Types.ObjectId>;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }] })
  prices: Array<Types.ObjectId>;

  @Prop()
  latitudeMap: string;

  @Prop()
  longitudeMap: string;

  @Prop()
  openingTime: string;

  @Prop()
  closingTime: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Timer' }] })
  timers: Array<Types.ObjectId>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: Types.ObjectId;

  @Prop()
  isActive: boolean;
}

export const ClubSchema = SchemaFactory.createForClass(Club);
