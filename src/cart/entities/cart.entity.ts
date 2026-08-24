import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

import { Product } from '../../product/entities/product.entity';

@ObjectType()
export class CartItem {
  @Field(() => Product)
  product: Product;

  @Field(() => Int)
  quantity: number;

  @Field()
  subtotal: number;
}

@ObjectType()
export class Cart {
  @Field(() => ID)
  id: string;

  @Field(() => [CartItem])
  items: CartItem[];

  @Field()
  total: number;
}
