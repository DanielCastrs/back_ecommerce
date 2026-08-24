import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartItem } from './entities/cart.entity';
import {
  CartItem as CartItemSchema,
  CartDocument,
} from './schemas/cart.schema';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { CartService } from './cart.service';
import { AddToCartInput } from './dto/add-to-cart.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateCartItemInput } from './dto/update-cart-item.input';

@Resolver(() => Cart)
export class CartResolver {
  constructor(
    private readonly cartService: CartService,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => Cart)
  myCart(
    @CurrentUser()
    user: {
      sub: string;
      email: string;
      role: string;
    },
  ) {
    return this.cartService.findOrCreate(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Cart)
  addToCart(
    @CurrentUser()
    user: {
      sub: string;
      email: string;
      role: string;
    },

    @Args('input')
    input: AddToCartInput,
  ) {
    return this.cartService.addToCart(
      user.sub,
      input.productId,
      input.quantity,
    );
  }
  @ResolveField(() => Number)
  async total(@Parent() cart: CartDocument) {
    let total = 0;

    for (const item of cart.items) {
      const product = await this.productModel.findById(item.productId).exec();

      if (!product) {
        continue;
      }

      total += product.price * item.quantity;
    }

    return total;
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Cart)
  updateCartItem(
    @CurrentUser()
    user: {
      sub: string;
      email: string;
      role: string;
    },

    @Args('input')
    input: UpdateCartItemInput,
  ) {
    return this.cartService.updateCartItem(
      user.sub,
      input.productId,
      input.quantity,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => Cart)
  removeFromCart(
    @CurrentUser()
    user: {
      sub: string;
      email: string;
      role: string;
    },

    @Args('productId', {
      type: () => String,
    })
    productId: string,
  ) {
    return this.cartService.removeFromCart(user.sub, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Cart)
  clearCart(
    @CurrentUser()
    user: {
      sub: string;
      email: string;
      role: string;
    },
  ) {
    return this.cartService.clearCart(user.sub);
  }
}

//cart item resolver, criando comentario para separar o resolver do cart item do resolver do cart
@Resolver(() => CartItem)
export class CartItemResolver {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  @ResolveField(() => Product)
  async product(@Parent() item: CartItemSchema) {
    const product = await this.productModel.findById(item.productId).exec();

    if (!product) {
      throw new NotFoundException('Produto do carrinho não encontrado');
    }

    return product;
  }

  @ResolveField(() => Number)
  async subtotal(@Parent() item: CartItemSchema) {
    const product = await this.productModel.findById(item.productId).exec();

    if (!product) {
      throw new NotFoundException('Produto do carrinho não encontrado');
    }

    return product.price * item.quantity;
  }
}
