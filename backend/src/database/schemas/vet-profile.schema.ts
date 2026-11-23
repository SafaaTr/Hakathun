import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VetProfileDocument = VetProfile & Document;

@Schema({ timestamps: true, collection: 'vet_profiles' })
export class VetProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  address: string;

  @Prop({
    required: true,
    enum: ['available', 'unavailable'],
    default: 'available',
  })
  status: string;
}

export const VetProfileSchema = SchemaFactory.createForClass(VetProfile);
