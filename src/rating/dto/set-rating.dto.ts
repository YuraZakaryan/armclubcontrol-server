import { IsEnum, IsMongoId, IsNumber } from 'class-validator';
import { ObjectId, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

enum ERating {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

export class SetRatingDto {
  @ApiProperty({ example: '64e5b1be8d6a60e8c6931f16', description: 'user' })
  @IsMongoId({ message: 'Invalid ID format' })
  readonly user: Types.ObjectId;

  @ApiProperty({ example: '64ec7e531457a232ca2c45fa', description: 'club' })
  @IsMongoId({ message: 'Invalid ID format' })
  readonly club: Types.ObjectId;

  @ApiProperty({ example: '5', description: 'rating' })
  @IsNumber({}, { message: 'must be a number' })
  @IsEnum(ERating)
  readonly rating: number;
}
