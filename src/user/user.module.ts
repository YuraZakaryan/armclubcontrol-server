import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { PRIVATE_KEY_REFRESH } from '../constants';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: PRIVATE_KEY_REFRESH || 'SECRET_KEY_REFRESH',
    }),
  ],
})
export class UserModule {}
