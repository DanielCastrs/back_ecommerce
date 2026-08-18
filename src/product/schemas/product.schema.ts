import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Category } from 'src/category/schemas/category.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({
  timestamps: true,
})
export class Product {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  price: number;

  @Prop({
    required: true,
    default: 0,
  })
  stock: number;

  @Prop()
  description: string;

  @Prop({
    type: Types.ObjectId,
    ref: Category.name,
    required: true,
  })
  categoryId: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
