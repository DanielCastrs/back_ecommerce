import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { OrderService } from './order.service';
import { Order } from './schemas/order.schema';
import { Cart } from '../cart/schemas/cart.schema';
import { Product } from '../product/schemas/product.schema';
import { OrderStatus } from './enums/order-status.enum';

type CartItemMock = { productId: Types.ObjectId; quantity: number };

describe('OrderService', () => {
  let service: OrderService;

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn().mockResolvedValue(true),
    abortTransaction: jest.fn().mockResolvedValue(true),
    endSession: jest.fn().mockResolvedValue(true),
  };

  // mockOrderModel precisa ser "construível" (usado com `new this.orderModel(...)`)
  const mockOrderModel: any = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(true),
  }));
  mockOrderModel.find = jest.fn();
  mockOrderModel.findOne = jest.fn();
  mockOrderModel.findById = jest.fn();
  mockOrderModel.db = {
    startSession: jest.fn().mockResolvedValue(mockSession),
  };

  const mockCartModel = {
    findOne: jest.fn(),
  };

  const mockProductModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: getModelToken(Cart.name), useValue: mockCartModel },
        { provide: getModelToken(Product.name), useValue: mockProductModel },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);

    jest.clearAllMocks();
    mockOrderModel.db.startSession.mockResolvedValue(mockSession);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // =========================================================
  // createOrder
  // =========================================================

  describe('createOrder', () => {
    it('deve criar um pedido com sucesso, atualizar estoque e limpar o carrinho', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId();

      const product = {
        _id: productId,
        name: 'Notebook',
        price: 1000,
        stock: 10,
        save: jest.fn().mockResolvedValue(true),
      };

      const cart = {
        userId: new Types.ObjectId(userId),
        items: [{ productId, quantity: 2 }] as CartItemMock[],
        save: jest.fn().mockResolvedValue(true),
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      const result = await service.createOrder(userId);

      // pedido criado com os itens e total corretos
      expect(mockOrderModel).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.any(Types.ObjectId),
          items: [
            expect.objectContaining({
              productId,
              name: 'Notebook',
              unitPrice: 1000,
              quantity: 2,
              subtotal: 2000,
            }),
          ],
          total: 2000,
          status: OrderStatus.PENDING,
        }),
      );

      expect(result.save).toHaveBeenCalled();

      // estoque do produto foi decrementado e salvo
      expect(product.stock).toBe(8);
      expect(product.save).toHaveBeenCalled();

      // carrinho foi esvaziado e salvo
      expect(cart.items).toEqual([]);
      expect(cart.save).toHaveBeenCalled();
    });

    it('deve rejeitar quando o carrinho não existir', async () => {
      const userId = new Types.ObjectId().toString();

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.createOrder(userId)).rejects.toThrow(
        new NotFoundException('Carrinho não encontrado'),
      );

      expect(mockProductModel.findById).not.toHaveBeenCalled();
    });

    it('deve rejeitar quando o carrinho estiver vazio', async () => {
      const userId = new Types.ObjectId().toString();

      const cart = {
        userId: new Types.ObjectId(userId),
        items: [] as CartItemMock[],
        save: jest.fn(),
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      await expect(service.createOrder(userId)).rejects.toThrow(
        new BadRequestException(
          'Não é possível criar um pedido com o carrinho vazio',
        ),
      );
    });

    it('deve rejeitar quando um produto do carrinho não for encontrado', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId();

      const cart = {
        userId: new Types.ObjectId(userId),
        items: [{ productId, quantity: 1 }] as CartItemMock[],
        save: jest.fn(),
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.createOrder(userId)).rejects.toThrow(
        NotFoundException,
      );

      expect(cart.save).not.toHaveBeenCalled();
    });

    it('deve rejeitar quando o estoque for insuficiente', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId();

      const product = {
        _id: productId,
        name: 'Mouse',
        price: 100,
        stock: 1,
        save: jest.fn(),
      };

      const cart = {
        userId: new Types.ObjectId(userId),
        items: [{ productId, quantity: 5 }] as CartItemMock[],
        save: jest.fn(),
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      await expect(service.createOrder(userId)).rejects.toThrow(
        new BadRequestException('Estoque insuficiente para o produto: Mouse'),
      );

      expect(product.save).not.toHaveBeenCalled();
      expect(cart.save).not.toHaveBeenCalled();
    });
  });

  // =========================================================
  // findMyOrders
  // =========================================================

  describe('findMyOrders', () => {
    it('deve retornar os pedidos do usuário ordenados por data de criação', async () => {
      const userId = new Types.ObjectId().toString();
      const orders = [{ id: '1' }, { id: '2' }];

      const sortMock = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(orders),
      });

      mockOrderModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.findMyOrders(userId);

      expect(result).toEqual(orders);
      expect(mockOrderModel.find).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
      });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  // =========================================================
  // findMyOrder
  // =========================================================

  describe('findMyOrder', () => {
    it('deve retornar um pedido do usuário', async () => {
      const userId = new Types.ObjectId().toString();
      const orderId = new Types.ObjectId().toString();
      const order = { id: orderId };

      mockOrderModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(order),
      });

      const result = await service.findMyOrder(userId, orderId);

      expect(result).toEqual(order);
      expect(mockOrderModel.findOne).toHaveBeenCalledWith({
        _id: orderId,
        userId: expect.any(Types.ObjectId),
      });
    });

    it('deve rejeitar id de pedido inválido', async () => {
      const userId = new Types.ObjectId().toString();

      await expect(service.findMyOrder(userId, 'id-invalido')).rejects.toThrow(
        new BadRequestException('ID do pedido inválido'),
      );

      expect(mockOrderModel.findOne).not.toHaveBeenCalled();
    });

    it('deve rejeitar quando o pedido não for encontrado', async () => {
      const userId = new Types.ObjectId().toString();
      const orderId = new Types.ObjectId().toString();

      mockOrderModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findMyOrder(userId, orderId)).rejects.toThrow(
        new NotFoundException('Pedido não encontrado'),
      );
    });
  });

  // =========================================================
  // findAllOrders
  // =========================================================

  describe('findAllOrders', () => {
    it('deve retornar todos os pedidos ordenados por data de criação', async () => {
      const orders = [{ id: '1' }, { id: '2' }];

      const sortMock = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(orders),
      });

      mockOrderModel.find.mockReturnValue({ sort: sortMock });

      const result = await service.findAllOrders();

      expect(result).toEqual(orders);
      expect(mockOrderModel.find).toHaveBeenCalledWith();
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  // =========================================================
  // findOrder
  // =========================================================

  describe('findOrder', () => {
    it('deve retornar um pedido pelo id', async () => {
      const orderId = new Types.ObjectId().toString();
      const order = { id: orderId };

      mockOrderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(order),
      });

      const result = await service.findOrder(orderId);

      expect(result).toEqual(order);
      expect(mockOrderModel.findById).toHaveBeenCalledWith(orderId);
    });

    it('deve rejeitar id de pedido inválido', async () => {
      await expect(service.findOrder('id-invalido')).rejects.toThrow(
        new BadRequestException('ID do pedido inválido'),
      );

      expect(mockOrderModel.findById).not.toHaveBeenCalled();
    });

    it('deve rejeitar quando o pedido não for encontrado', async () => {
      const orderId = new Types.ObjectId().toString();

      mockOrderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOrder(orderId)).rejects.toThrow(
        new NotFoundException('Pedido não encontrado'),
      );
    });
  });

  // =========================================================
  // cancelOrder
  // =========================================================

  describe('cancelOrder', () => {
    it('deve cancelar um pedido pendente e devolver o estoque dos produtos', async () => {
      const userId = new Types.ObjectId().toString();
      const orderId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId();

      const product = {
        _id: productId,
        name: 'Notebook',
        stock: 5,
        save: jest.fn().mockResolvedValue(true),
      };

      const order = {
        _id: orderId,
        status: OrderStatus.PENDING,
        items: [{ productId, name: 'Notebook', quantity: 2 }],
        save: jest.fn().mockResolvedValue(true),
      };

      mockOrderModel.findOne.mockResolvedValue(order);
      mockProductModel.findById.mockResolvedValue(product);

      const result = await service.cancelOrder(userId, orderId);

      expect(result).toBe(order);
      expect(order.status).toBe(OrderStatus.CANCELLED);
      expect(order.save).toHaveBeenCalledWith({ session: mockSession });

      expect(product.stock).toBe(7); // 5 + 2 devolvidos
      expect(product.save).toHaveBeenCalledWith({ session: mockSession });

      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.abortTransaction).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('deve rejeitar id de pedido inválido', async () => {
      const userId = new Types.ObjectId().toString();

      await expect(service.cancelOrder(userId, 'id-invalido')).rejects.toThrow(
        new BadRequestException('ID do pedido inválido'),
      );

      expect(mockOrderModel.db.startSession).not.toHaveBeenCalled();
    });

    it('deve rejeitar e reverter a transação quando o pedido não for encontrado', async () => {
      const userId = new Types.ObjectId().toString();
      const orderId = new Types.ObjectId().toString();

      mockOrderModel.findOne.mockResolvedValue(null);

      await expect(service.cancelOrder(userId, orderId)).rejects.toThrow(
        new NotFoundException('Pedido não encontrado'),
      );

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('deve rejeitar quando o status do pedido não for PENDING', async () => {
      const userId = new Types.ObjectId().toString();
      const orderId = new Types.ObjectId().toString();

      const order = {
        _id: orderId,
        status: OrderStatus.CANCELLED,
        items: [],
        save: jest.fn(),
      };

      mockOrderModel.findOne.mockResolvedValue(order);

      await expect(service.cancelOrder(userId, orderId)).rejects.toThrow(
        new BadRequestException('Somente pedidos PENDING podem ser cancelados'),
      );

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(order.save).not.toHaveBeenCalled();
    });

    it('deve rejeitar e reverter a transação quando um produto do pedido não for encontrado', async () => {
      const userId = new Types.ObjectId().toString();
      const orderId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId();

      const order = {
        _id: orderId,
        status: OrderStatus.PENDING,
        items: [{ productId, name: 'Notebook', quantity: 1 }],
        save: jest.fn(),
      };

      mockOrderModel.findOne.mockResolvedValue(order);
      mockProductModel.findById.mockResolvedValue(null);

      await expect(service.cancelOrder(userId, orderId)).rejects.toThrow(
        new NotFoundException('Produto Notebook não encontrado'),
      );

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(order.save).not.toHaveBeenCalled();
    });
  });

  it('deve rejeitar cancelamento de pedido já pago (PAID)', async () => {
    const userId = new Types.ObjectId().toString();
    const orderId = new Types.ObjectId().toString();

    const order = {
      _id: orderId,
      status: OrderStatus.PAID,
      items: [],
      save: jest.fn(),
    };

    mockOrderModel.findOne.mockResolvedValue(order);

    await expect(service.cancelOrder(userId, orderId)).rejects.toThrow(
      new BadRequestException('Somente pedidos PENDING podem ser cancelados'),
    );

    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(order.save).not.toHaveBeenCalled();
  });
});
