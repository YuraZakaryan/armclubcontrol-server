import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { JwtService } from '@nestjs/jwt';
import { FindOneParams, IGenerateRefreshToken } from '../types';
import { Response } from 'express';
import { MeDto } from '../auth/dto/me-dto';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async create(dto: CreateUserDto) {
    return this.userModel.create({
      ...dto,
      role: !dto.role ? 'USER' : dto.role,
      refreshToken: await this.generateRefreshToken(dto),
    });
  }

  async generateRefreshToken(user: IGenerateRefreshToken) {
    const payload = {
      sub: user.id,
      username: user.username,
      type: 'refresh',
    };
    return this.jwtService.sign(payload);
  }
  async findUserByUsername(username: string) {
    return this.userModel.findOne({ username });
  }
  async findUserByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
  async findUserByUsernameOrEmail(login: string) {
    return (
      (await this.findUserByUsername(login)) ||
      (await this.findUserByEmail(login))
    );
  }
  async getAll(): Promise<Array<User>> {
    const users = await this.userModel.find();
    if (users.length === 0) {
      throw new HttpException('Users not found', HttpStatus.NOT_FOUND);
    }
    return users;
  }
  async getOne(params: FindOneParams) {
    const user = await this.userModel.findById(params.id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
