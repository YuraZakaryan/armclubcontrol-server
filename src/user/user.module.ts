import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { EXPIRE_TIME_REFRESH, PRIVATE_KEY_REFRESH } from '../constants';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: PRIVATE_KEY_REFRESH || 'SECRET_KEY_REFRESH',
      signOptions: { expiresIn: EXPIRE_TIME_REFRESH + 'd' },
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        auth: {
          user: 'armclubcontrol@gmail.com',
          pass: 'yrteekfcsetfccme'
        }
      }
    })
  ],
})
export class UserModule {}
