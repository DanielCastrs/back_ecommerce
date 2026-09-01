import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Category,
  CategoryDocument,
} from '../category/schemas/category.schema';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll() {
    return this.productModel.find().exec();
  }

  async findById(id: string) {
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
    categoryId: string;
  }) {
    const category = await this.categoryModel.findById(data.categoryId).exec();

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }
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
      categoryId?: string;
    },
  ) {
    if (data.categoryId) {
      const category = await this.categoryModel
        .findById(data.categoryId)
        .exec();

      if (!category) {
        throw new NotFoundException('Categoria não encontrada');
      }
    }

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

  async delete(id: string) {
    const product = await this.productModel.findByIdAndDelete(id).exec();

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async findCategory(categoryId: string) {
    return this.categoryModel.findById(categoryId).exec();
  }
}
