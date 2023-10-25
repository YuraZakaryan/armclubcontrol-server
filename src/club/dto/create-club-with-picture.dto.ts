import { ApiProperty } from '@nestjs/swagger';
import { CreateClubDto } from './create-club.dto';

export class CreateClubWithPictureDto extends CreateClubDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'picture',
  })
  picture: Express.Multer.File;
}
