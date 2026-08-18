import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateCategoryInput } from './dto/create-category.input';
import { Category } from './entities/category.entity';
import { CategoryService } from './category.service';
import { UpdateCategoryInput } from './dto/update-category.input';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Query(() => [Category])
  async categories() {
    return this.categoryService.findAll();
  }

  @Query(() => Category)
  async category(
    @Args('id', { type: () => ID })
    id: string,
  ) {
    return this.categoryService.findCategory(id);
  }

  @Mutation(() => Category)
  async createCategory(
    @Args('input')
    input: CreateCategoryInput,
  ) {
    return this.categoryService.create(input);
  }

  @Mutation(() => Category)
  async deleteCategory(
    @Args('id', { type: () => ID })
    id: string,
  ) {
    return this.categoryService.delete(id);
  }
  @Mutation(() => Category)
  async updateCategory(
    @Args('input')
    input: UpdateCategoryInput,
  ) {
    const { id, ...data } = input;

    return this.categoryService.update(id, data);
  }
}
