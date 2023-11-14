import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Edvard', description: 'name' })
  @IsString({ message: 'name - must be a string' })
  @IsNotEmpty({ message: 'name - is required' })
  readonly name: string;

  @ApiProperty({ example: 'Curry', description: 'lastname' })
  @IsString({ message: 'lastname - must be a string' })
  readonly lastname: string;

  @ApiProperty({ example: 'John.Curry1@gmail.com', description: 'email' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'email - is required' })
  readonly email: string;

  @ApiProperty({ example: 'Curry6123', description: 'username' })
  @Length(8, 16, {
    message: 'username - length should be between 8 and 16 characters',
  })
  @IsString({ message: 'username - must be a string' })
  @IsNotEmpty({ message: 'username - is required' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'username - must contain only english letters and numbers',
  })
  readonly username: string;

  @ApiProperty({ example: 29, description: 'age' })
  @IsNumber({}, { message: 'age - must be a number' })
  @Min(13)
  @Max(120)
  readonly age: number;
}
