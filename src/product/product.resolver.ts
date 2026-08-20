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
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => [Product])
  async products() {
    return this.productService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField(() => Category)
  category(@Parent() product: Product) {
    return this.productService.findCategory(product.categoryId);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Product)
  async product(@Args('id', { type: () => ID }) id: string) {
    return this.productService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Product)
  async createProduct(@Args('input') input: CreateProductInput) {
    return this.productService.create(input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Product)
  async updateProduct(@Args('input') input: UpdateProductInput) {
    const { id, ...data } = input;

    return this.productService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Product)
  async deleteProduct(@Args('id', { type: () => ID }) id: string) {
    return this.productService.delete(id);
  }
}
