import { Types } from 'mongoose';

export interface IUpdateData {
  title: string;
  description: string;
  info: string;
  author: Types.ObjectId;
  updatedAt: string;
  picture?: string;
}
