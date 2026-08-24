import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Cart, CartItemSchema, CartSchema } from './schemas/cart.schema';

import { CartService } from './cart.service';
import { CartItemResolver, CartResolver } from './cart.resolver';
import { Product, ProductSchema } from 'src/product/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Cart.name,
        schema: CartSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: 'CartItem',
        schema: CartItemSchema,
      },
    ]),
  ],

  providers: [CartService, CartResolver, CartItemResolver],

  exports: [CartService],
})
export class CartModule {}
