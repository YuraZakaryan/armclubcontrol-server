import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class UpdateTimerPriceDto {
  @ApiProperty({ example: 'PS4', description: 'title' })
  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'is required' })
  readonly title: string;

  @ApiProperty({ example: 600, description: 'price' })
  @IsNumber({}, { message: 'must be a number' })
  @Length(2, 5, { message: 'length should be between 2 and 4 characters' })
  readonly price: number;
}
