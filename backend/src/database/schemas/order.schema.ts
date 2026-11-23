import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CartItem } from './cart.schema';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ required: true, unique: true })
  referenceCode: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Store', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ type: Array, required: true })
  items: CartItem[];

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({ required: true })
  deliveryAddress: string;

  @Prop({ required: true, default: 'cash_on_delivery' })
  paymentMethod: string;

  @Prop({
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
