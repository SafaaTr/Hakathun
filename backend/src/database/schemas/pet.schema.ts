import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PetDocument = Pet & Document;

@Schema({ timestamps: true, collection: 'pets' })
export class Pet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  referenceCode: string;

  @Prop({ default: '' })
  name: string;

  @Prop({ required: true, trim: true })
  petType: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })
  vaccinationRecordUrl: string;

  @Prop({ required: true, type: Date })
  lastVetVisitDate: Date;

  @Prop({ required: true })
  photoUrl: string;

  @Prop({ default: '' })
  notes: string;
}

export const PetSchema = SchemaFactory.createForClass(Pet);
