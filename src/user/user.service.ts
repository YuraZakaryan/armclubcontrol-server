import * as bcrypt from 'bcryptjs';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { JwtService } from '@nestjs/jwt';
import { FindOneParams } from '../types';
import { MailerService } from '@nestjs-modules/mailer';
import { MeDto } from 'src/auth/dto/me-dto';
import { checkAccess } from 'src/logic';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordUserDto } from './dto/update-password-user.dto';

@Injectable()
export class UserService {
  constructor(
    private mailerService: MailerService,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async create(dto: CreateUserDto) {
    return this.userModel.create({
      ...dto,
      role: !dto.role ? 'USER' : dto.role,
      refreshToken: '',
      activated: false,
      otp: null,
      expiresOtpIn: null,
    });
  }

  async sendOtpToMail(
    dto: SendOtpDto,
    param: FindOneParams,
    req: { user: MeDto },
  ) {
    const id = param.id;
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await checkAccess(id, req.user);

    if (user.activated) {
      throw new HttpException(
        'User activated previously',
        HttpStatus.FORBIDDEN,
      );
    }

    const updater = this.otpUpdater();
    user.otp = updater.otp;
    user.expiresOtpIn = updater.expiresOtpIn;
    const saved = await user.save();

    const otp = user.otp;
    const brandName = 'ARMCLUB CONTROL';
    const from = 'armclubcontrol@gmail.com';
    const to = dto.email;
    const subject = 'OTP կոդ, հաշիվը ակտիվացնելու համար';
    const html = `
    <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
      <div style="margin: 50px auto; width: 70%; padding: 20px 0">
        <div style="border-bottom: 1px solid #eee">
          <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">${brandName}</a>
        </div>
        <p style="font-size: 1.1em">Ողջու՝յն,</p>
        <p>Շնորհակալություն որ ընտրել եք ArmClub Control –ը. Օգտագործիր այս OTP կոդը, ձեր հաշվի ակտիվացման համար։ Հիշեցնենք որ կոդը գործում է 5 րոպե։</p>
        <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${otp}</h2>
        <p style="font-size: 0.9em;">Regards,<br />${brandName}</p>
        <hr style="border: none; border-top: 1px solid #eee" />
        <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
          <p>${brandName} Inc</p>
          <p>Armenia</p>
        </div>
      </div>
    </div>
  `;
    if (saved) {
      const sendMessage = this.mailerService.sendMail({
        to,
        from,
        subject,
        html,
      });
      if (!sendMessage) {
        throw new HttpException(
          'Error while sending opt code to mail',
          HttpStatus.BAD_REQUEST,
        );
      }
      return {
        message: `OTP ${otp} successfully sended to mail ${to} `,
      };
    }
  }

  async confirmAccountWithEmail(
    param: FindOneParams,
    dto: ConfirmAccountDto,
    req: { user: MeDto },
  ) {
    const id = param.id;
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await checkAccess(id, req.user);

    if (user.activated) {
      throw new HttpException(
        'User activated previously',
        HttpStatus.FORBIDDEN,
      );
    }

    const expiresOtpIn = user.expiresOtpIn;
    const now = new Date().getTime();
    if (now > expiresOtpIn) {
      throw new HttpException(
        'One-Time Password has expired. Please request a new OTP.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (Number(dto.code) !== user.otp) {
      throw new HttpException(
        'One-Time Password is wrong!',
        HttpStatus.UNAUTHORIZED,
      );
    }

    user.activated = true;

    const success = await user.save();

    if (success) {
      user.email = dto.email;
      await user.save();
      return {
        message: `Account ${dto.email} successfully activated!`,
      };
    }
  }

  otpUpdater() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const second = 1000;
    const expiresOtpIn = new Date().setTime(
      new Date().getTime() + second * 1000,
    );
    return {
      otp,
      expiresOtpIn,
    };
  }

  async generateRefreshToken(payload: any) {
    return this.jwtService.sign(payload);
  }

  async findUserByUsername(username: string): Promise<User> {
    return this.userModel.findOne({ username }).populate('clubs');
  }

  async findUserById(id: Types.ObjectId): Promise<User> {
    return this.userModel.findById(id).populate('clubs');
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).populate('clubs');
  }

  async findUserByUsernameOrEmail(login: string): Promise<User> {
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

  async update(
    params: FindOneParams,
    dto: UpdateUserDto,
    req: { user: MeDto },
  ) {
    const id = params.id;
    await checkAccess(id, req.user);

    const currentUser = await this.userModel.findById(id);

    if (!currentUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!currentUser.activated && dto.email) {
      return this.userModel.findByIdAndUpdate(
        id,
        {
          name: dto.name,
          lastname: dto.lastname,
          username: dto.username,
          age: dto.age,
          email: dto.email,
        },
        { new: true },
      );
    } else {
      return this.userModel.findByIdAndUpdate(
        id,
        {
          name: dto.name,
          lastname: dto.lastname,
          username: dto.username,
          age: dto.age,
        },
        { new: true },
      );
    }
  }
  async updatePassword(
    params: FindOneParams,
    dto: UpdatePasswordUserDto,
    req: { user: MeDto },
  ) {
    const id = params.id;
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await checkAccess(id, req.user);
    if (dto.newPassword === dto.oldPassword) {
      throw new HttpException(
        'Old and new passwords must be different',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!(await bcrypt.compare(dto.oldPassword, user.password))) {
      throw new HttpException('Old password is wrong', HttpStatus.BAD_REQUEST);
    }
    user.password = await bcrypt.hash(dto.newPassword, 10);
    const updatedUser = await user.save();
    if (updatedUser) {
      return {
        message: 'User password is changed successfully !',
      };
    }
  }
}
