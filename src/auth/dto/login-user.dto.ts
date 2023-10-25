import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: '3aqaryan', description: 'username' })
  @Length(6, 20, { message: 'length should be between 8 and 16 characters' })
  @IsString({ message: 'must be a string' })
  @IsNotEmpty({ message: 'is required' })
  readonly login: string;
  @ApiProperty({ example: '6691', description: 'password' })
  @IsString({ message: 'must be a string' })
  @Length(10, 30, { message: 'length should be between 8 and 16 characters' })
  @IsNotEmpty({ message: 'is required' })
  readonly password: string;
}
