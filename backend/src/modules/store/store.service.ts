import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Store, StoreDocument } from '../../database/schemas/store.schema';
import { Product, ProductDocument } from '../../database/schemas/product.schema';
import { Cart, CartDocument } from '../../database/schemas/cart.schema';
import { Order, OrderDocument } from '../../database/schemas/order.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class StoreService implements OnModuleInit {
  constructor(
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async onModuleInit() {
    await this.seedProducts();
  }

  private async seedProducts() {
    const store = await this.storeModel.findOne({ name: 'Happy Paws Pet Store' });
    if (store) {
      const count = await this.productModel.countDocuments({ storeId: store._id });
      if (count === 0) {
        await this.productModel.insertMany([
          {
            storeId: store._id,
            name: 'Royal Canin Mini Adult (3kg)',
            details: 'Premium balanced nutrition for adult dogs weighing up to 10kg.',
            price: 150000,
            imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
            status: 'available',
          },
          {
            storeId: store._id,
            name: 'Purina Pro Plan Cat Salmon',
            details: 'High-protein dry cat food rich in natural omega fatty acids.',
            price: 120000,
            imageUrl: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400',
            status: 'available',
          },
          {
            storeId: store._id,
            name: 'Ergonomic Reflective Dog Harness',
            details: 'Breathable padded vest harness with front clip.',
            price: 65000,
            imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
            status: 'available',
          },
          {
            storeId: store._id,
            name: 'Stainless Steel Pet Bowl',
            details: 'Durable anti-slip bowl for water or food.',
            price: 35000,
            imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400',
            status: 'available',
          },
        ]);
      }
    }
  }

  // Stores
  async getActiveStores() {
    return this.storeModel.find({ status: 'active' });
  }

  async getStoreProducts(storeId: string) {
    return this.productModel.find({
      storeId: new Types.ObjectId(storeId),
      status: 'available',
    });
  }

  // Cart
  async addToCart(userId: string, productId: string, quantity: number) {
    const product = await this.productModel.findById(productId);
    if (!product || product.status !== 'available') {
      throw new NotFoundException('Product not available');
    }

    let cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart) {
      cart = await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        items: [],
      });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId: product._id,
        storeId: product.storeId,
        productName: product.name,
        unitPrice: product.price,
        quantity,
      });
    }

    await cart.save();
    const totalPrice = cart.items.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0,
    );

    return { cart, totalPrice };
  }

  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty.');
    }

    const totalPrice = cart.items.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0,
    );
    const storeId = cart.items[0].storeId;
    const refCode = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await this.orderModel.create({
      referenceCode: refCode,
      customerId: new Types.ObjectId(userId),
      storeId,
      items: cart.items,
      totalPrice,
      deliveryAddress: dto.deliveryAddress,
      paymentMethod: 'cash_on_delivery',
      status: 'pending',
    });

    // Empty cart
    cart.items = [];
    await cart.save();

    return order;
  }

  // Store Owner Inventory
  async addProductForStore(userId: string, dto: CreateProductDto) {
    let store = await this.storeModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!store) {
      store = await this.storeModel.create({
        userId: new Types.ObjectId(userId),
        name: 'My Pet Store',
        phone: '09XXXXXXXX',
        address: 'Damascus',
        status: 'active',
      });
    }

    return this.productModel.create({
      storeId: store._id,
      name: dto.name,
      details: dto.details,
      price: dto.price,
      imageUrl: dto.imageUrl,
      status: 'available',
    });
  }

  async updateProduct(productId: string, dto: Partial<CreateProductDto>) {
    const updated = await this.productModel.findByIdAndUpdate(productId, dto, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Product not found');
    return updated;
  }

  // NFR-06 Soft Delete rule
  async deactivateProduct(productId: string) {
    const updated = await this.productModel.findByIdAndUpdate(
      productId,
      { status: 'unavailable' },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Product not found');
    return updated;
  }

  async getStoreOrders(userId: string) {
    const store = await this.storeModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!store) return [];
    return this.orderModel
      .find({ storeId: store._id })
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 });
  }

  async updateOrderStatus(orderId: string, status: string) {
    const updated = await this.orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Order not found');
    return updated;
  }
}
