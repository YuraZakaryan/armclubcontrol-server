import * as process from 'process';
import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ClubModule } from './club/club.module';
import { RatingModule } from './rating/rating.module';
import { TimerModule } from './timer/timer.module';
import { TimerPriceModule } from './timer-price/timer-price.module';
import { ScheduleModule } from '@nestjs/schedule';

const NODE_ENV = `.${process.env.NODE_ENV}.env`;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: NODE_ENV,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '..', 'static'),
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot('mongodb://localhost:27017/arm-club-control'),
    UserModule,
    AuthModule,
    ClubModule,
    CommentModule,
    RatingModule,
    SubscriptionModule,
    TimerModule,
    TimerPriceModule,
  ],
})
export class AppModule {}
