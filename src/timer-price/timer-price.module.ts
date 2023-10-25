import { Module } from '@nestjs/common';
import { TimerPriceController } from './timer-price.controller';
import { TimerPriceService } from './timer-price.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TimerPrice, TimerPriceSchema } from './timer-price.schema';
import { Club, ClubSchema } from '../club/club.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TimerPrice.name, schema: TimerPriceSchema },
      { name: Club.name, schema: ClubSchema },
    ]),
  ],
  controllers: [TimerPriceController],
  providers: [TimerPriceService],
})
export class TimerPriceModule {}
