import { Test, TestingModule } from '@nestjs/testing';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('OrderResolver', () => {
  let resolver: OrderResolver;

  const mockOrderService = {
    createOrder: jest.fn(),
    findMyOrders: jest.fn(),
    findMyOrder: jest.fn(),
    findAllOrders: jest.fn(),
    cancelOrder: jest.fn(),
  };

  const currentUser = {
    sub: 'user-123',
    email: 'daniel@email.com',
    role: 'CUSTOMER',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderResolver,
        { provide: OrderService, useValue: mockOrderService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<OrderResolver>(OrderResolver);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('createOrder', () => {
    it('deve criar um pedido para o usuário autenticado', async () => {
      const order = {
        id: 'order-1',
        status: 'PENDING',
        userId: currentUser.sub,
      };

      mockOrderService.createOrder.mockResolvedValue(order);

      await expect(resolver.createOrder(currentUser)).resolves.toEqual(order);

      expect(mockOrderService.createOrder).toHaveBeenCalledWith(
        currentUser.sub,
      );
    });
  });

  describe('orders', () => {
    it('deve retornar os pedidos do usuário autenticado', async () => {
      const orders = [{ id: 'order-1', status: 'PENDING' }];

      mockOrderService.findMyOrders.mockResolvedValue(orders);

      await expect(resolver.orders(currentUser)).resolves.toEqual(orders);

      expect(mockOrderService.findMyOrders).toHaveBeenCalledWith(
        currentUser.sub,
      );
    });
  });

  describe('order', () => {
    it('deve buscar um pedido específico do usuário autenticado', async () => {
      const order = { id: 'order-1', status: 'PENDING' };

      mockOrderService.findMyOrder.mockResolvedValue(order);

      await expect(resolver.order('order-1', currentUser)).resolves.toEqual(
        order,
      );

      expect(mockOrderService.findMyOrder).toHaveBeenCalledWith(
        currentUser.sub,
        'order-1',
      );
    });
  });

  describe('allOrders', () => {
    it('deve retornar todos os pedidos (admin)', async () => {
      const orders = [
        { id: 'order-1', status: 'PENDING' },
        { id: 'order-2', status: 'PAID' },
      ];

      mockOrderService.findAllOrders.mockResolvedValue(orders);

      await expect(resolver.allOrders()).resolves.toEqual(orders);

      expect(mockOrderService.findAllOrders).toHaveBeenCalled();
    });
  });

  describe('cancelOrder', () => {
    it('deve cancelar um pedido do usuário autenticado', async () => {
      const order = { id: 'order-1', status: 'CANCELLED' };

      mockOrderService.cancelOrder.mockResolvedValue(order);

      await expect(
        resolver.cancelOrder('order-1', currentUser),
      ).resolves.toEqual(order);

      expect(mockOrderService.cancelOrder).toHaveBeenCalledWith(
        currentUser.sub,
        'order-1',
      );
    });
  });
});
