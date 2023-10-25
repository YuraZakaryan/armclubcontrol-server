import { ObjectId, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class MeDto extends Request {
  @ApiProperty({ example: '64df6dccd024862e26834421', description: 'sub' })
  readonly sub: Types.ObjectId;
  @ApiProperty({ example: '3aqaryan@mail.ru', description: 'email' })
  readonly email: string;
  @ApiProperty({ example: '3aqaryan', description: 'username' })
  readonly username: string;
  @ApiProperty({ example: 'ADMIN', description: 'role' })
  readonly role: string;
}
