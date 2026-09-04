import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Category } from '../../category/entities/category.entity';

@ObjectType()
export class Product {
  @Field()
  id: string;

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

  @Field(() => Category)
  category: Category;
}
