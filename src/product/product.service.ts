import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

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

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID inválido');
    }
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
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

  async update(
    id: string,
    data: {
      name?: string;
      price?: number;
      stock?: number;
      description?: string;
    },
  ) {
    const product = await this.productModel
      .findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }
}
