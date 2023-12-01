import { Types } from 'mongoose';
import { MeDto } from '../auth/dto/me-dto';
import { HttpException, HttpStatus } from '@nestjs/common';

export const checkAccess = async function (
  authorId: Types.ObjectId,
  user: MeDto,
): Promise<void> {
  if (
    authorId != user.sub &&
    user.role !== 'ADMIN' &&
    user.role !== 'MODERATOR'
  ) {
    throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
  }
};
