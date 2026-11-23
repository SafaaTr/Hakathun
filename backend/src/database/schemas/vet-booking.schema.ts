import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VetBookingDocument = VetBooking & Document;

@Schema({ timestamps: true, collection: 'vet_bookings' })
export class VetBooking {
  @Prop({ required: true, unique: true })
  referenceCode: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Pet', required: true })
  petId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  doctorId: Types.ObjectId;

  @Prop({ required: true })
  doctorName: string;

  @Prop({ required: true })
  slotId: string;

  @Prop({ required: true })
  appointmentDate: string;

  @Prop({ required: true })
  appointmentDay: string;

  @Prop({ required: true })
  appointmentTime: string;

  @Prop({
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;
}

export const VetBookingSchema = SchemaFactory.createForClass(VetBooking);
