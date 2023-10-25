import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EPaymentMethod, ESubscriptionStatus } from '../types';

export type SubscriptionDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop()
  startDate: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'File' })
  endDate: Date;

  @Prop()
  subscriptionStatus: ESubscriptionStatus;

  @Prop()
  paymentMethod: EPaymentMethod;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
