import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Public Stores & Products')
@Controller('stores')
export class PublicStoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @ApiOperation({ summary: 'List all active stores' })
  async getActiveStores() {
    return this.storeService.getActiveStores();
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'List all available products for a given store' })
  async getStoreProducts(@Param('id') id: string) {
    return this.storeService.getStoreProducts(id);
  }
}

@ApiTags('Cart & Checkout')
@Controller()
export class CartController {
  constructor(private readonly storeService: StoreService) {}

  @Post('cart/items')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add product item to cart' })
  async addToCart(
    @CurrentUser() user: { userId: string },
    @Body() body: { productId: string; quantity: number },
  ) {
    const result = await this.storeService.addToCart(
      user.userId,
      body.productId,
      body.quantity || 1,
    );
    return { data: result };
  }

  @Post('orders/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Checkout cart with Cash on Delivery' })
  async checkout(
    @CurrentUser() user: { userId: string },
    @Body() dto: CheckoutDto,
  ) {
    const order = await this.storeService.checkout(user.userId, dto);
    return {
      message: 'Order created successfully. Delivery on Cash.',
      data: order,
    };
  }
}

@ApiTags('Store Owner Management')
@Controller('store')
@UseGuards(JwtAuthGuard)
export class StoreOwnerController {
  constructor(private readonly storeService: StoreService) {}

  @Get('products')
  @ApiOperation({ summary: 'List all products for the authenticated store owner' })
  async getOwnerProducts(@CurrentUser() user: { userId: string }) {
    const products = await this.storeService.getOwnerProducts(user?.userId);
    return { data: products };
  }

  @Post('products')
  @ApiOperation({ summary: 'Add new product to store inventory' })
  async addProduct(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateProductDto,
  ) {
    const product = await this.storeService.addProductForStore(user.userId, dto);
    return {
      message: 'Product created successfully',
      data: product,
    };
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update product information' })
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    const updated = await this.storeService.updateProduct(id, dto);
    return {
      message: 'Product updated successfully',
      data: updated,
    };
  }

  @Patch('products/:id/deactivate')
  @ApiOperation({ summary: 'Soft deactivate product to unavailable (NFR-06)' })
  async deactivateProduct(@Param('id') id: string) {
    const updated = await this.storeService.deactivateProduct(id);
    return {
      message: 'Product status changed to unavailable',
      data: updated,
    };
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get incoming purchase orders for the store' })
  async getStoreOrders(@CurrentUser() user: { userId: string }) {
    const orders = await this.storeService.getStoreOrders(user.userId);
    return { data: orders };
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Approve or reject customer purchase order' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.storeService.updateOrderStatus(id, dto.status);
    return {
      message: `Order ${dto.status} successfully`,
      data: order,
    };
  }
}
