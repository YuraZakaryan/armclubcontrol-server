import { ApiProperty } from '@nestjs/swagger';
import { CreateClubDto } from './create-club.dto';

export class CreateClubWithPictureDto extends CreateClubDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Picture',
  })
  picture: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Poster picture',
  })
  posterPicture: Express.Multer.File;
}
