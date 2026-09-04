import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Order, OrderDocument } from '../order/schemas/order.schema';
import { PaymentMethod } from './enums/payment-method.enum';
import { OrderStatus } from '../order/enums/order-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,

    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async payOrder(userId: string, orderId: string, method: PaymentMethod) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('ID do pedido inválido');
    }

    const session = await this.paymentModel.db.startSession();

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
          'Somente pedidos PENDING podem ser pagos',
        );
      }

      const payment = new this.paymentModel({
        orderId: order._id,
        userId: new Types.ObjectId(userId),
        amount: order.total,
        method,
        status: PaymentStatus.APPROVED,
      });

      await payment.save({ session });

      order.status = OrderStatus.PAID;

      await order.save({ session });

      await session.commitTransaction();

      return payment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
