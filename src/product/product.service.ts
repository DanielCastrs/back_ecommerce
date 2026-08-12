import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async findAll() {
    return this.productModel.find().exec();
  }
  async create(data: {
    name: string;
    price: number;
    stock: number;
    description?: string;
  }) {
    const product = new this.productModel(data);

    return product.save();
  }
}
