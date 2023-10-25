import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export enum ERole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
}

export class CreateUserDto {
  @ApiProperty({ example: 'Edvard', description: 'name' })
  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'is required' })
  readonly name: string;

  @ApiProperty({ example: 'Curry', description: 'lastname' })
  @IsString({ message: 'must be a string' })
  readonly lastname: string;

  @ApiProperty({ example: 'John.Curry1@gmail.com', description: 'email' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'is required' })
  readonly email: string;

  @ApiProperty({ example: 'Curry6123', description: 'username' })
  @Length(8, 16, { message: 'length should be between 8 and 16 characters' })
  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'is required' })
  readonly username: string;

  @ApiProperty({ example: '123456789', description: 'password' })
  @IsString({ message: 'must be a string' })
  @Length(8, 16, { message: 'length should be between 8 and 16 characters' })
  @IsNotEmpty({ message: 'is required' })
  readonly password: string;

  @ApiProperty({ example: 29, description: 'age' })
  @IsNumber({}, { message: 'must be a number' })
  @Min(13)
  @Max(120)
  readonly age: number;

  @ApiProperty({ example: 'USER', description: 'role', required: false })
  @IsString({ message: 'must be string' })
  @IsEnum(ERole)
  @IsNotEmpty({ message: 'is required' })
  readonly role: string;
}
