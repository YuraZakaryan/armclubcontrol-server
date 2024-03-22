import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FavouriteClubDocument = HydratedDocument<FavouriteClub>;

@Schema({ timestamps: true })
export class FavouriteClub {
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }] })
  clubs: Array<Types.ObjectId>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;
}

export const FavouriteClubsSchema = SchemaFactory.createForClass(FavouriteClub);
