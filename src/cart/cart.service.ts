import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async findOrCreate(userId: string) {
    let cart = await this.cartModel
      .findOne({
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!cart) {
      cart = await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        items: [],
      });
    }

    return cart;
  }

  async addToCart(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException('A quantidade deve ser maior que zero');
    }

    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('ID do produto inválido');
    }

    const product = await this.productModel.findById(productId).exec();

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (product.stock < quantity) {
      throw new BadRequestException(
        'Quantidade solicitada maior que o estoque disponível',
      );
    }

    const cart = await this.findOrCreate(userId);

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.stock) {
        throw new BadRequestException(
          'Quantidade total no carrinho maior que o estoque disponível',
        );
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        productId: new Types.ObjectId(productId),
        quantity,
      });
    }

    await cart.save();

    return cart;
  }

  async updateCartItem(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException('A quantidade deve ser maior que zero');
    }

    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('ID do produto inválido');
    }

    const product = await this.productModel.findById(productId).exec();

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (quantity > product.stock) {
      throw new BadRequestException(
        'Quantidade solicitada maior que o estoque disponível',
      );
    }

    const cart = await this.cartModel
      .findOne({
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (!item) {
      throw new NotFoundException('Produto não encontrado no carrinho');
    }

    item.quantity = quantity;

    await cart.save();

    return cart;
  }
  async removeFromCart(userId: string, productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('ID do produto inválido');
    }

    const cart = await this.cartModel
      .findOne({
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Produto não encontrado no carrinho');
    }

    cart.items.splice(itemIndex, 1);

    await cart.save();

    return cart;
  }
  async clearCart(userId: string) {
    const cart = await this.cartModel
      .findOne({
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    cart.items = [];

    await cart.save();

    return cart;
  }
}
