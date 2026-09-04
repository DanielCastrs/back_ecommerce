import { Test, TestingModule } from '@nestjs/testing';
import { PaymentResolver } from './payment.resolver';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('PaymentResolver', () => {
  let resolver: PaymentResolver;

  const mockPaymentService = {
    payOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentResolver,
        { provide: PaymentService, useValue: mockPaymentService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<PaymentResolver>(PaymentResolver);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('payOrder', () => {
    it('deve processar o pagamento de um pedido', async () => {
      const currentUser = {
        sub: 'user-123',
        email: 'daniel@email.com',
        role: 'CUSTOMER',
      };

      const input = {
        orderId: 'order-1',
        method: 'CREDIT_CARD',
      };

      const payment = {
        id: 'payment-1',
        orderId: input.orderId,
        method: input.method,
        status: 'PAID',
      };

      mockPaymentService.payOrder.mockResolvedValue(payment);

      await expect(
        resolver.payOrder(input as any, currentUser),
      ).resolves.toEqual(payment);

      expect(mockPaymentService.payOrder).toHaveBeenCalledWith(
        currentUser.sub,
        input.orderId,
        input.method,
      );
    });
  });
});
