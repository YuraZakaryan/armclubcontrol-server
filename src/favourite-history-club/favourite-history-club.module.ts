import { Module } from '@nestjs/common';
import { FavouriteHistoryClubController } from './favourite-history-club.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FavouriteClub, FavouriteClubsSchema } from './schema/favourite.schema';
import { HistoryClub, HistoryClubSchema } from './schema/history-club.schema';
import { FavouriteAndLastVisitedService } from './favourite-history-club.service';
import { UserService } from '../user/user.service';
import { User, UserSchema } from '../user/user.schema';
import { Club, ClubSchema } from '../club/club.schema';

@Module({
  controllers: [FavouriteHistoryClubController],
  providers: [FavouriteAndLastVisitedService, UserService],
  imports: [
    MongooseModule.forFeature([
      { name: FavouriteClub.name, schema: FavouriteClubsSchema },
      { name: HistoryClub.name, schema: HistoryClubSchema },
      { name: User.name, schema: UserSchema },
      { name: Club.name, schema: ClubSchema },
    ]),
  ],
})
export class FavouriteHistoryClubModule {}
