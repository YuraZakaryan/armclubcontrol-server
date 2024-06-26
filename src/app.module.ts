import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import * as process from 'process';
import { AuthModule } from './auth/auth.module';
import { ClubModule } from './club/club.module';
import { CommentModule } from './comment/comment.module';
import { FavouriteHistoryClubModule } from './favourite-history-club/favourite-history-club.module';
import { RatingModule } from './rating/rating.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { TimerHistoryModule } from './timer-history/timer-history.module';
import { TimerPriceModule } from './timer-price/timer-price.module';
import { TimerModule } from './timer/timer.module';
import { UserModule } from './user/user.module';
import { WebsocketModule } from './websocket/websocket.module';

const NODE_ENV = `.${process.env.NODE_ENV}.env`;

// const DEFAULT_ADMIN = {
//   email: 'yura.zaqaryan6691@gmail.com',
//   password: 'MESSImessi1?',
// };
//
// const authenticate = async (email: string, password: string) => {
//   if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
//     return Promise.resolve(DEFAULT_ADMIN);
//   }
//   return null;
// };

@Module({
  imports: [
    // import('@adminjs/nestjs').then(({ AdminModule }) =>
    //   AdminModule.createAdminAsync({
    //     useFactory: () => ({
    //       adminJsOptions: {
    //         rootPath: '/admin',
    //         resources: [],
    //       },
    //       auth: {
    //         authenticate,
    //         cookieName: 'adminjs',
    //         cookiePassword: 'secret',
    //       },
    //       sessionOptions: {
    //         resave: true,
    //         saveUninitialized: true,
    //         secret: 'secret',
    //       },
    //     }),
    //   }),
    // ),
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
    TimerHistoryModule,
    FavouriteHistoryClubModule,
    WebsocketModule,
  ],
})
export class AppModule {}
