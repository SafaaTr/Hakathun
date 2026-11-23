import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoreDocument = Store & Document;

@Schema({ timestamps: true, collection: 'stores' })
export class Store {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, enum: ['active', 'closed'], default: 'active' })
  status: string;
}

export const StoreSchema = SchemaFactory.createForClass(Store);
