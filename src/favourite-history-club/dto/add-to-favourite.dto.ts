import { Types } from 'mongoose';

export class AddToFavouriteDto {
  readonly userId: Types.ObjectId;
  readonly clubId: Types.ObjectId;
}
