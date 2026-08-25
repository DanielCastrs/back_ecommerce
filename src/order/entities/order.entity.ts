import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { registerEnumType } from '@nestjs/graphql';
import { OrderStatus } from '../enums/order-status.enum';

@ObjectType()
export class OrderItem {
  @Field(() => ID)
  productId: string;

  @Field()
  name: string;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  subtotal: number;
}

@ObjectType()
export class Order {
  @Field(() => ID)
  id: string;

  @Field(() => [OrderItem])
  items: OrderItem[];

  @Field(() => Float)
  total: number;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
