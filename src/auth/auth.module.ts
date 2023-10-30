import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { EXPIRE_TIME_ACCESS, PRIVATE_KEY_ACCESS } from '../constants';
import { UserService } from '../user/user.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      global: true,
      secret: PRIVATE_KEY_ACCESS || 'PRIVATE_KEY_ACCESS',
      signOptions: { expiresIn: EXPIRE_TIME_ACCESS + 's' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
})
export class AuthModule {}
