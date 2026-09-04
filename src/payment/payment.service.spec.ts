import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { PaymentService } from './payment.service';
import { Payment } from './schemas/payment.schema';
import { Order } from '../order/schemas/order.schema';
import { PaymentMethod } from './enums/payment-method.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { OrderStatus } from '../order/enums/order-status.enum';

describe('PaymentService', () => {
  let service: PaymentService;

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn().mockResolvedValue(true),
    abortTransaction: jest.fn().mockResolvedValue(true),
    endSession: jest.fn().mockResolvedValue(true),
  };

  // mockPaymentModel precisa ser "construível" (usado com `new this.paymentModel(...)`)
  const mockPaymentModel: any = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(true),
  }));
  mockPaymentModel.db = {
    startSession: jest.fn().mockResolvedValue(mockSession),
  };

  const mockOrderModel = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: getModelToken(Payment.name), useValue: mockPaymentModel },
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);

    jest.clearAllMocks();
    mockPaymentModel.db.startSession.mockResolvedValue(mockSession);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // =========================================================
  // payOrder
  // =========================================================

  describe('payOrder', () => {
    it('deve pagar um pedido pendente e retornar o pagamento aprovado', async () => {
      const userId = new Types.ObjectId().toString();
      const orderId = new Types.ObjectId().toString();

      const order = {
        _id: orderId,
        status: OrderStatus.PENDING,
        total: 1500,
        save: jest.fn().mockResolvedValue(true),
      };

      mockOrderModel.findOne.mockResolvedValue(order);

      const result = await service.payOrder(userId, orderId, PaymentMethod.PIX);

      // pagamento criado com os dados corretos
      expect(mockPaymentModel).toHaveBeenCalledWith({
        orderId: order._id,
        userId: expect.any(Types.ObjectId),
        amount: order.total,
        method: PaymentMethod.PIX,
        status: PaymentStatus.APPROVED,
      });

      expect(result.save).toHaveBeenCalledWith({ session: mockSession });

      // pedido foi marcado como PAID e salvo
      expect(order.status).toBe(OrderStatus.PAID);
      expect(order.save).toHaveBeenCalledWith({ session: mockSession });

      // transação commitada, sem abort
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.abortTransaction).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();

      // consulta correta ao pedido
      expect(mockOrderModel.findOne).toHaveBeenCalledWith(
        {
          _id: orderId,
          userId: expect.any(Types.ObjectId),
        },
        null,
        { session: mockSession },
      );
    });

    it('deve rejeitar id de pedido inválido sem abrir sessão', async () => {
      const userId = new Types.ObjectId().toString();

      await expect(
        service.payOrder(userId, 'id-invalido', PaymentMethod.PIX),
      ).rejects.toThrow(new BadRequestException('ID do pedido inválido'));

      expect(mockPaymentModel.db.startSession).not.toHaveBeenCalled();
      expect(mockOrderModel.findOne).not.toHaveBeenCalled();
    });

    it('deve rejeitar e reverter a transação quando o pedido não for encontrado', async () => {
      const userId = new Types.ObjectId().toString();
      const orderId = new Types.ObjectId().toString();

      mockOrderModel.findOne.mockResolvedValue(null);

      await expect(
        service.payOrder(userId, orderId, PaymentMethod.PIX),
      ).rejects.toThrow(new NotFoundException('Pedido não encontrado'));

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(mockPaymentModel).not.toHaveBeenCalled();
    });

    it('deve rejeitar e reverter a transação quando o pedido não estiver PENDING', async () => {
      const userId = new Types.ObjectId().toString();
      const orderId = new Types.ObjectId().toString();

      const order = {
        _id: orderId,
        status: OrderStatus.PAID,
        total: 1500,
        save: jest.fn(),
      };

      mockOrderModel.findOne.mockResolvedValue(order);

      await expect(
        service.payOrder(userId, orderId, PaymentMethod.PIX),
      ).rejects.toThrow(
        new BadRequestException('Somente pedidos PENDING podem ser pagos'),
      );

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
      expect(order.save).not.toHaveBeenCalled();
      expect(mockPaymentModel).not.toHaveBeenCalled();
    });

    it('deve reverter a transação se o save do pagamento falhar', async () => {
      const userId = new Types.ObjectId().toString();
      const orderId = new Types.ObjectId().toString();

      const order = {
        _id: orderId,
        status: OrderStatus.PENDING,
        total: 1500,
        save: jest.fn(),
      };

      mockOrderModel.findOne.mockResolvedValue(order);

      // sobrescreve o mock padrão só para este teste: save rejeita
      mockPaymentModel.mockImplementationOnce((data: any) => ({
        ...data,
        save: jest.fn().mockRejectedValue(new Error('erro ao salvar')),
      }));

      await expect(
        service.payOrder(userId, orderId, PaymentMethod.PIX),
      ).rejects.toThrow('erro ao salvar');

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
      expect(order.status).toBe(OrderStatus.PENDING); // não deve ter avançado
      expect(order.save).not.toHaveBeenCalled();
    });

    it('deve encerrar a sessão mesmo quando ocorre erro inesperado', async () => {
      const userId = new Types.ObjectId().toString();
      const orderId = new Types.ObjectId().toString();

      mockOrderModel.findOne.mockRejectedValue(new Error('falha no banco'));

      await expect(
        service.payOrder(userId, orderId, PaymentMethod.PIX),
      ).rejects.toThrow('falha no banco');

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });
});
