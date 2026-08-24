import { Field, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateCartItemInput {
  @Field(() => ID)
  productId: string;

  @Field(() => Int)
  quantity: number;
}
