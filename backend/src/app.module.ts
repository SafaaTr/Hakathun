import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { PetsModule } from './modules/pets/pets.module';
import { StoreModule } from './modules/store/store.module';
import { VetModule } from './modules/vet/vet.module';
import { HostModule } from './modules/host/host.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rafeeq_db'),
    DatabaseModule,
    AuthModule,
    PetsModule,
    StoreModule,
    VetModule,
    HostModule,
    ReviewsModule,
    AdminModule,
  ],
})
export class AppModule {}
