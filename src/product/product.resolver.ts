import { Query, Resolver } from '@nestjs/graphql';

import { Product } from './entities/product.entity';
import { ProductService } from './product.service';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Query(() => [Product])
  async products() {
    return this.productService.findAll();
  }
}
