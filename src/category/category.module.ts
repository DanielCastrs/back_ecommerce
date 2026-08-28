import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Category, CategorySchema } from './schemas/category.schema';

import { CategoryResolver } from './category.resolver';
import { CategoryService } from './category.service';
import { Product, ProductSchema } from 'src/product/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
  ],

  providers: [CategoryResolver, CategoryService],

  exports: [CategoryService],
})
export class CategoryModule {}
