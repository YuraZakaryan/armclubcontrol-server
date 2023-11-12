import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class ConfirmAccountDto {
  @ApiProperty({ example: '1234', description: 'code' })
  @IsNotEmpty({ message: 'code - is required' })
  @Length(6, 6, { message: 'code - length should be 6 characters' })
  readonly code: string;

  @ApiProperty({ example: 'email@gmail.com', description: 'email' })
  readonly email: string;
}
