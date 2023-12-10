import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateTimerInfoDto {
  @ApiProperty({
    example: 'PC 1',
    description: 'Title',
  })
  @IsString()
  readonly title: string;
}
