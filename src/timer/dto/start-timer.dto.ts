import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StartTimerDto {
  @ApiProperty({
    example: '12:00:00',
    description: 'Start',
  })
  @IsNotEmpty({ message: 'start - is required' })
  @IsString()
  readonly start: string;
}
