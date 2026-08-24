import { Field, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class AddToCartInput {
  @Field(() => ID)
  productId: string;

  @Field(() => Int)
  quantity: number;
}
