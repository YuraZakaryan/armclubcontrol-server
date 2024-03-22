import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type HistoryClubDocument = HydratedDocument<HistoryClub>;

@Schema({ timestamps: true })
export class HistoryClub {
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }] })
  clubs: Array<Types.ObjectId>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;
}

export const HistoryClubSchema = SchemaFactory.createForClass(HistoryClub);
