import { Types } from 'mongoose';

export interface IUpdateData {
  title: string;
  description: string;
  info: string;
  region: string;
  city: string;
  address: string;
  phone: string;
  latitudeMap: string;
  longitudeMap: string;
  author: Types.ObjectId;
  updatedAt: string;
  picture?: string;
  openingTime: string;
  closingTime: string;
}
