import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsMongoId, IsNumber, Min } from 'class-validator';

@InputType()
export class UpdateCartItemInput {
  @Field(() => ID)
  @IsMongoId()
  productId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number;
}
