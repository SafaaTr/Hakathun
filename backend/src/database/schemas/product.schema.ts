import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Store', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  details: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true, enum: ['available', 'unavailable'], default: 'available' })
  status: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
