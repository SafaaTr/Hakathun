import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({ required: true, unique: true })
  referenceCode: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  fromUserId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['doctor', 'host_caregiver', 'pet_owner'],
  })
  targetType: string;

  @Prop({ required: true })
  targetId: string;

  @Prop({
    required: true,
    enum: ['vet_booking', 'host_booking'],
  })
  bookingType: string;

  @Prop({ type: Types.ObjectId, required: true })
  bookingId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ maxlength: 300, default: '' })
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Unique index preventing double reviews for the same booking by the same user
ReviewSchema.index({ fromUserId: 1, bookingType: 1, bookingId: 1 }, { unique: true });
ReviewSchema.index({ targetType: 1, targetId: 1 });
ReviewSchema.index({ createdAt: -1 });
