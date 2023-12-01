import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class UpdateTimerDto {
  @ApiProperty({
    example: '60',
    description: 'Remaining time',
  })
  @IsString()
  readonly remainingTime?: string;

  @ApiProperty({
    example: true,
    description: 'isInfinite',
  })
  @IsBoolean()
  readonly isInfinite?: boolean;

  @ApiProperty({
    example: 600,
    description: 'Price',
  })
  @IsNumber()
  readonly price: number;
}
