import { Field, Float, ID, InputType, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  price: number;

  @Field(() => Int)
  @IsNumber()
  @IsOptional()
  @Min(0)
  stock: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ID)
  categoryId: string;
}
