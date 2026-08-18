import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { Category } from 'src/category/entities/category.entity';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Query(() => [Product])
  async products() {
    return this.productService.findAll();
  }

  @ResolveField(() => Category)
  category(@Parent() product: Product) {
    return this.productService.findCategory(product.categoryId);
  }

  @Query(() => Product)
  async product(@Args('id', { type: () => ID }) id: string) {
    return this.productService.findById(id);
  }

  @Mutation(() => Product)
  async createProduct(@Args('input') input: CreateProductInput) {
    return this.productService.create(input);
  }

  @Mutation(() => Product)
  async updateProduct(@Args('input') input: UpdateProductInput) {
    const { id, ...data } = input;

    return this.productService.update(id, data);
  }

  @Mutation(() => Product)
  async deleteProduct(@Args('id', { type: () => ID }) id: string) {
    return this.productService.delete(id);
  }
}
