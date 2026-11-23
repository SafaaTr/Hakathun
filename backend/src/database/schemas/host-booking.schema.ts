import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HostBookingDocument = HostBooking & Document;

@Schema({ timestamps: true, collection: 'host_bookings' })
export class HostBooking {
  @Prop({ required: true, unique: true })
  referenceCode: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  petOwnerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  hostUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Pet', required: true })
  petId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ default: '' })
  foodNotes: string;

  @Prop({
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;
}

export const HostBookingSchema = SchemaFactory.createForClass(HostBooking);
