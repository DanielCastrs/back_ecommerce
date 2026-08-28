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
interface StockUpdate {
  product: ProductDocument;
  quantity: number;
}
import { Types } from 'mongoose'; // valor real
import { Schema as MongooseSchema } from 'mongoose'; // só pro @Prop()
import { OrderStatus } from './enums/order-status.enum';

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

    //deu erro e precisou de interface StockUpdate, então criei a interface

    const orderItems: OrderItem[] = [];
    const stockUpdates: StockUpdate[] = [];

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
          `Estoque insuficiente para o produto: ${product.name}`,
        );
      }

      const subtotal = product.price * cartItem.quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        unitPrice: product.price,
        quantity: cartItem.quantity,
        subtotal,
      });

      stockUpdates.push({
        product,
        quantity: cartItem.quantity,
      });
    }

    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    const order = new this.orderModel({
      userId: new Types.ObjectId(userId),
      items: orderItems,
      total,
      status: OrderStatus.PENDING,
    });

    await order.save();

    for (const stockUpdate of stockUpdates) {
      stockUpdate.product.stock -= stockUpdate.quantity;

      await stockUpdate.product.save();
    }

    cart.items = [];

    await cart.save();

    return order;
  }
  async findMyOrders(userId: string) {
    return this.orderModel
      .find({
        userId: new Types.ObjectId(userId),
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findMyOrder(userId: string, orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('ID do pedido inválido');
    }

    const order = await this.orderModel
      .findOne({
        _id: orderId,
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return order;
  }
  async findAllOrders() {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }
  async findOrder(orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('ID do pedido inválido');
    }

    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return order;
  }
  async cancelOrder(userId: string, orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('ID do pedido inválido');
    }

    const session = await this.orderModel.db.startSession();

    try {
      session.startTransaction();

      const order = await this.orderModel.findOne(
        {
          _id: orderId,
          userId: new Types.ObjectId(userId),
        },
        null,
        { session },
      );

      if (!order) {
        throw new NotFoundException('Pedido não encontrado');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(
          'Somente pedidos PENDING podem ser cancelados',
        );
      }

      for (const item of order.items) {
        const product = await this.productModel.findById(item.productId, null, {
          session,
        });

        if (!product) {
          throw new NotFoundException(`Produto ${item.name} não encontrado`);
        }

        product.stock += item.quantity;

        await product.save({ session });
      }

      order.status = OrderStatus.CANCELLED;

      await order.save({ session });

      await session.commitTransaction();

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
