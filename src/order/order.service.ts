import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderItem } from './schemas/order.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { Types } from 'mongoose'; // valor real
import { Schema as MongooseSchema } from 'mongoose'; // só pro @Prop()

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async createOrder(userId: string) {
    const cart = await this.cartModel
      .findOne({
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    if (cart.items.length === 0) {
      throw new BadRequestException(
        'Não é possível criar um pedido com o carrinho vazio',
      );
    }

    const orderItems: OrderItem[] = [];

    for (const cartItem of cart.items) {
      const product = await this.productModel
        .findById(cartItem.productId)
        .exec();

      if (!product) {
        throw new NotFoundException(
          `Produto ${cartItem.productId} não encontrado`,
        );
      }

      if (cartItem.quantity > product.stock) {
        throw new BadRequestException(
          `Estoque insuficiente para o produto ${product.name}`,
        );
      }

      const subtotal = product.price * cartItem.quantity;

      orderItems.push({
        productId: product._id as Types.ObjectId,
        name: product.name,
        unitPrice: product.price,
        quantity: cartItem.quantity,
        subtotal,
      });

      const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

      const order = new this.orderModel({
        userId: new Types.ObjectId(userId),
        items: orderItems,
        total,
        status: 'PENDING',
      });

      await order.save();

      return order;
    }
  }
}
