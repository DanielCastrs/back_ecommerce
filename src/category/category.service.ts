import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryInput } from './dto/create-category.input';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async findAll() {
    return this.categoryModel.find().exec();
  }

  async findCategory(id: string) {
    const category = await this.categoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async create(input: CreateCategoryInput) {
    const name = input.name.trim();

    const existingCategory = await this.categoryModel.findOne({
      name: {
        $regex: `^${name}$`,
        $options: 'i',
      },
    });

    if (existingCategory) {
      throw new ConflictException('Categoria já cadastrada');
    }

    const category = new this.categoryModel({
      name,
    });

    return category.save();
  }

  async delete(id: string) {
    const category = await this.categoryModel.findByIdAndDelete(id).exec();

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
    },
  ) {
    const category = await this.categoryModel
      .findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID da categoria inválido');
    }

    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    const productsCount = await this.productModel.countDocuments({
      categoryId: category._id,
    });

    if (productsCount > 0) {
      throw new ConflictException(
        'Não é possível excluir a categoria porque existem produtos vinculados a ela',
      );
    }

    await this.categoryModel.deleteOne({
      _id: id,
    });

    return true;
  }
}
