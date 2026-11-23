import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Pet, PetSchema } from './schemas/pet.schema';
import { HostProfile, HostProfileSchema } from './schemas/host-profile.schema';
import { VetProfile, VetProfileSchema } from './schemas/vet-profile.schema';
import { VetSlot, VetSlotSchema } from './schemas/vet-slot.schema';
import { Store, StoreSchema } from './schemas/store.schema';
import { Product, ProductSchema } from './schemas/product.schema';
import { Cart, CartSchema } from './schemas/cart.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { HostBooking, HostBookingSchema } from './schemas/host-booking.schema';
import { VetBooking, VetBookingSchema } from './schemas/vet-booking.schema';
import { Review, ReviewSchema } from './schemas/review.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Pet.name, schema: PetSchema },
      { name: HostProfile.name, schema: HostProfileSchema },
      { name: VetProfile.name, schema: VetProfileSchema },
      { name: VetSlot.name, schema: VetSlotSchema },
      { name: Store.name, schema: StoreSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Order.name, schema: OrderSchema },
      { name: HostBooking.name, schema: HostBookingSchema },
      { name: VetBooking.name, schema: VetBookingSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
