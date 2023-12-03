import { Types } from 'mongoose';

export class CreateTimerHistoryDto {
  readonly timerId: Types.ObjectId;
  readonly title: string;
  readonly time: string;
  readonly isInfinite: boolean;
  readonly start: string;
  readonly end: string;
  readonly price: number;
  readonly finalPrice: number;
  readonly manuallyStopped: boolean;
  readonly club: Types.ObjectId;
}
