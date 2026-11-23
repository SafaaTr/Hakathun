import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import {
  PublicStoreController,
  CartController,
  StoreOwnerController,
} from './store.controller';

@Module({
  controllers: [PublicStoreController, CartController, StoreOwnerController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
