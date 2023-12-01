import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Validate,
} from 'class-validator';
import {
  IsLatitude,
  IsLongitude,
  LatitudeLongitudePairValidator,
} from '../../validation/club';

export class CreateClubDto {
  @ApiProperty({ example: 'R-Studio Network', description: 'title' })
  @IsString({ message: 'title - must be a string' })
  @IsNotEmpty({ message: 'title - is required' })
  @Length(3, 75, {
    message: 'title - length should be between 3 and 75 characters',
  })
  readonly title: string;

  @ApiProperty({ example: '64e5b1be8d6a60e8c6931f16', description: 'author' })
  @IsMongoId({ message: 'author - Invalid ID format' })
  @IsNotEmpty({ message: 'author - is required' })
  readonly author: Types.ObjectId;

  @ApiProperty({
    example:
      'R-Studio is, in my opinion, the best data recovery software today (not counting professional software and hardware systems).',
    description: 'description',
  })
  @IsString({ message: 'description - must be a string' })
  @IsNotEmpty({ message: 'description - is required' })
  readonly description: string;

  @ApiProperty({
    example: 'info example about installation',
    description: 'info',
  })
  @ApiProperty({
    example: '08:00:00',
    description: 'Opening Time',
  })
  @IsString({ message: 'openingTime - must be a string' })
  readonly openingTime: string;

  @ApiProperty({
    example: '23:00:00',
    description: 'Closing Time',
  })
  @IsString({ message: 'closingTime - must be a string' })
  readonly closingTime: string;

  @IsString({ message: 'info - must be a string' })
  readonly info: string;

  @ApiProperty({
    example: 'Ararat',
    description: 'Region',
  })
  @IsString({ message: 'region - must be a string' })
  readonly region: string;

  @ApiProperty({
    example: 'Artashat',
    description: 'City',
  })
  @IsString({ message: 'city - must be a string' })
  readonly city: string;

  @ApiProperty({
    example: 'Ogostosi 23',
    description: 'Address',
  })
  @IsString({ message: 'address - must be a string' })
  readonly address: string;

  @IsString({ message: 'closingTime - must be a string' })
  @ApiProperty({
    example: '93-77-77-77',
    description: 'Phone',
  })
  readonly phone: string;

  @ApiProperty({
    description: 'Latitude of the map',
    example: '39.951128',
    type: String,
  })
  @IsOptional()
  @IsLatitude()
  @IsString({ message: 'latitudeMap - must be a string' })
  @Validate(LatitudeLongitudePairValidator, {
    message:
      'If latitudeMap or longitudeMap is provided, must be provided as well, and vice versa.',
  })
  readonly latitudeMap: string;

  @ApiProperty({
    description: 'Longitude of the map',
    example: '44.545757',
    type: String,
  })
  @IsOptional()
  @IsLongitude()
  @IsString({ message: 'longitudeMap - must be a string' })
  readonly longitudeMap: string;
}
