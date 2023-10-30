import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from '../user/user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/user.schema';
import { IGenerateAccessToken } from '../types';
import { MeDto } from './dto/me-dto';
import { Response } from 'express';
import { EXPIRE_TIME_ACCESS } from '../constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async login(dto: LoginUserDto) {
    const user = await this.validateUser(dto);
    return await this.generateAuthTokens(user);
  }

  private async validateUser(dto: LoginUserDto) {
    const user = await this.userService.findUserByUsernameOrEmail(dto.login);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new HttpException(
        'Login or Password is wrong!',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }

  async registration(dto: CreateUserDto, res: Response) {
    await this.checkExistingUser(dto.username, dto.email);

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });
    res.status(HttpStatus.CREATED);
    return await this.generateAuthTokens(user);
  }

  private async checkExistingUser(username: string, email: string) {
    const existingUserByUsername = await this.userService.findUserByUsername(
      username,
    );
    const existingUserByEmail = await this.userService.findUserByEmail(email);

    if (existingUserByUsername && existingUserByEmail) {
      throw new HttpException(
        'User with this username and email already exists!',
        HttpStatus.BAD_REQUEST,
      );
    } else if (existingUserByUsername) {
      throw new HttpException(
        'User with this username already exists!',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (existingUserByEmail) {
      throw new HttpException(
        'User with this email already exists!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // async updateRefreshToken(refresh: string) {
  //   const decodedRefresh = jwt_decode<IGenerateRefreshToken>(refresh);
  //   const user = await this.userService.findUserByUsername(
  //     decodedRefresh.username,
  //   );
  //
  //   if (!user || user.refreshToken !== refresh) {
  //     throw new HttpException('Invalid refresh token', HttpStatus.FORBIDDEN);
  //   }
  //
  //   const newRefreshToken = await this.userService.generateRefreshToken(user);
  //   const updatedUser = await this.userModel
  //     .findOneAndUpdate(
  //       { username: decodedRefresh.username },
  //       { refreshToken: newRefreshToken },
  //       { new: true },
  //     )
  //     .exec();
  //   if (!updatedUser) {
  //     throw new HttpException(
  //       'Failed to update user',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  //
  //   return await this.generateAuthTokens(updatedUser);
  // }

  async me(req: { user: MeDto }): Promise<User> {
    const token: MeDto = req.user;
    if (token) {
      const user = await this.userService.findUserByUsername(token.username);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    }

    throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
  }

  private async generateAuthTokens(user: IGenerateAccessToken) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return {
      user,
      tokens: {
        access_token: this.jwtService.sign(payload),
        refresh_token: await this.userService.generateRefreshToken(payload),
        expiresIn: new Date().setTime(
          new Date().setTime(new Date().getTime() + EXPIRE_TIME_ACCESS * 1000),
        ),
      },
    };
  }
}
