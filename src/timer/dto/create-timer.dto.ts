import { Types } from 'mongoose';
import { IsDefined, IsMongoId, Validate } from 'class-validator';
import { IsNumberOrString } from '../../validation';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTimerDto {
  @IsDefined()
  @Validate(IsNumberOrString)
  @ApiProperty({
    example: 'First timer',
    description: 'Title',
  })
  readonly title: string;

  @ApiProperty({
    example: 'Club ID',
    description: 'Club',
  })
  @IsMongoId()
  readonly club: Types.ObjectId;

  @ApiProperty({
    example: 'Author ID',
    description: 'Author',
  })
  @IsMongoId()
  readonly author: Types.ObjectId;
}
