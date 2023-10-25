import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateTimerPriceDto {
  @ApiProperty({ example: 'PS4', description: 'title' })
  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'is required' })
  readonly title: string;

  @ApiProperty({ example: 600, description: 'price' })
  @IsNumber({}, { message: 'must be a number' })
  @Length(2, 5, { message: 'length should be between 2 and 4 characters' })
  readonly price: number;

  @ApiProperty({ example: '651be8ab264798c0b3ebc522', description: 'club' })
  @IsMongoId({ message: 'Invalid ID format' })
  readonly club: Types.ObjectId;

  @ApiProperty({ example: '651be8ab264798c0b3ebc522', description: 'author' })
  @IsMongoId({ message: 'Invalid ID format' })
  readonly author: Types.ObjectId;
}
