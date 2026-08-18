import { Field, Float, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateProductInput {
  @Field()
  name: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  stock: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ID)
  categoryId: string;
}
