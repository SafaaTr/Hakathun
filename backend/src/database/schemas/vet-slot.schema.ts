import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VetSlotDocument = VetSlot & Document;

@Schema({ timestamps: true, collection: 'vet_slots' })
export class VetSlot {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  doctorId: Types.ObjectId;

  @Prop({ required: true, index: true })
  date: string; // YYYY-MM-DD

  @Prop({ required: true })
  day: string; // e.g. Mon, Tue, ...

  @Prop({ required: true })
  time: string; // HH:mm (24-hour)

  @Prop({
    required: true,
    enum: ['available', 'booked'],
    default: 'available',
  })
  status: string;
}

export const VetSlotSchema = SchemaFactory.createForClass(VetSlot);
VetSlotSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });
