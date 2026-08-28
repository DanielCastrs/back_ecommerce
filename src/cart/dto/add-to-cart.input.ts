import { Field, ID, InputType, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsNumber,
  Min,
} from 'class-validator';

@InputType()
export class AddToCartInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  productId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number;
}
