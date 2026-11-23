import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HostProfileDocument = HostProfile & Document;

@Schema({ timestamps: true, collection: 'host_profiles' })
export class HostProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['home', 'barn'] })
  placeType: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  acceptedPetType: string;

  @Prop({ required: true, enum: ['free', 'paid'] })
  pricingType: string;

  @Prop({ type: Number, default: null })
  dailyPrice: number | null;

  @Prop({ required: true })
  foodCost: string;

  @Prop({
    required: true,
    enum: ['available', 'unavailable'],
    default: 'available',
  })
  status: string;
}

export const HostProfileSchema = SchemaFactory.createForClass(HostProfile);
