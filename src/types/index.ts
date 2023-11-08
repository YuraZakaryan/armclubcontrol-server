import { IsMongoId } from 'class-validator';

export * from './subscription';
export * from './application';

import { User } from '../user/user.schema';
import { ObjectId, Types } from 'mongoose';


export interface IGenerateRefreshToken {
  sub: Types.ObjectId;
}
export interface IGenerateAccessToken extends User {
  id?: ObjectId;
}
export type TMessage = {
  message: string;
};

export class FindOneParams {
  @IsMongoId({ message: 'id - Invalid ID format' })
  id: Types.ObjectId;
}
