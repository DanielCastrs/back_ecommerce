import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { CartResolver, CartItemResolver } from './cart.resolver';
import { CartService } from './cart.service';
import { Product } from '../product/schemas/product.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('CartResolver', () => {
  let resolver: CartResolver;

  const mockCartService = {
    findOrCreate: jest.fn(),
    addToCart: jest.fn(),
    updateCartItem: jest.fn(),
    removeFromCart: jest.fn(),
    clearCart: jest.fn(),
  };

  const mockProductModel = {
    findById: jest.fn(),
  };

  const currentUser = {
    sub: 'user-123',
    email: 'daniel@email.com',
    role: 'CUSTOMER',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartResolver,
        { provide: CartService, useValue: mockCartService },
        { provide: getModelToken(Product.name), useValue: mockProductModel },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<CartResolver>(CartResolver);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('myCart', () => {
    it('deve buscar ou criar o carrinho do usuário autenticado', async () => {
      const cart = { id: 'cart-1', userId: currentUser.sub, items: [] };

      mockCartService.findOrCreate.mockResolvedValue(cart);

      await expect(resolver.myCart(currentUser)).resolves.toEqual(cart);

      expect(mockCartService.findOrCreate).toHaveBeenCalledWith(
        currentUser.sub,
      );
    });
  });

  describe('addToCart', () => {
    it('deve adicionar um item ao carrinho', async () => {
      const input = { productId: 'prod-1', quantity: 2 };
      const cart = { id: 'cart-1', userId: currentUser.sub, items: [input] };

      mockCartService.addToCart.mockResolvedValue(cart);

      await expect(
        resolver.addToCart(currentUser, input as any),
      ).resolves.toEqual(cart);

      expect(mockCartService.addToCart).toHaveBeenCalledWith(
        currentUser.sub,
        input.productId,
        input.quantity,
      );
    });
  });

  describe('total', () => {
    it('deve calcular o total somando os itens com produto encontrado', async () => {
      const cart = {
        items: [
          { productId: 'prod-1', quantity: 2 },
          { productId: 'prod-2', quantity: 1 },
        ],
      };

      mockProductModel.findById
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue({ price: 10 }),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue({ price: 5 }),
        });

      const total = await resolver.total(cart as any);

      expect(total).toBe(25);
      expect(mockProductModel.findById).toHaveBeenCalledWith('prod-1');
      expect(mockProductModel.findById).toHaveBeenCalledWith('prod-2');
    });

    it('deve ignorar itens cujo produto não existe mais', async () => {
      const cart = {
        items: [
          { productId: 'prod-1', quantity: 2 },
          { productId: 'prod-inexistente', quantity: 1 },
        ],
      };

      mockProductModel.findById
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue({ price: 10 }),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(null),
        });

      const total = await resolver.total(cart as any);

      expect(total).toBe(20);
    });
  });

  describe('updateCartItem', () => {
    it('deve atualizar a quantidade de um item do carrinho', async () => {
      const input = { productId: 'prod-1', quantity: 5 };
      const cart = { id: 'cart-1', userId: currentUser.sub, items: [input] };

      mockCartService.updateCartItem.mockResolvedValue(cart);

      await expect(
        resolver.updateCartItem(currentUser, input as any),
      ).resolves.toEqual(cart);

      expect(mockCartService.updateCartItem).toHaveBeenCalledWith(
        currentUser.sub,
        input.productId,
        input.quantity,
      );
    });
  });

  describe('removeFromCart', () => {
    it('deve remover um item do carrinho', async () => {
      const cart = { id: 'cart-1', userId: currentUser.sub, items: [] };

      mockCartService.removeFromCart.mockResolvedValue(cart);

      await expect(
        resolver.removeFromCart(currentUser, 'prod-1'),
      ).resolves.toEqual(cart);

      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(
        currentUser.sub,
        'prod-1',
      );
    });
  });

  describe('clearCart', () => {
    it('deve limpar o carrinho do usuário autenticado', async () => {
      const cart = { id: 'cart-1', userId: currentUser.sub, items: [] };

      mockCartService.clearCart.mockResolvedValue(cart);

      await expect(resolver.clearCart(currentUser)).resolves.toEqual(cart);

      expect(mockCartService.clearCart).toHaveBeenCalledWith(currentUser.sub);
    });
  });
});

describe('CartItemResolver', () => {
  let resolver: CartItemResolver;

  const mockProductModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartItemResolver,
        { provide: getModelToken(Product.name), useValue: mockProductModel },
      ],
    }).compile();

    resolver = module.get<CartItemResolver>(CartItemResolver);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('product', () => {
    it('deve retornar o produto do item do carrinho', async () => {
      const item = { productId: 'prod-1', quantity: 2 };
      const product = { id: 'prod-1', name: 'Produto 1', price: 10 };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      await expect(resolver.product(item as any)).resolves.toEqual(product);

      expect(mockProductModel.findById).toHaveBeenCalledWith('prod-1');
    });

    it('deve lançar NotFoundException se o produto não existir', async () => {
      const item = { productId: 'prod-inexistente', quantity: 1 };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(resolver.product(item as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('subtotal', () => {
    it('deve calcular o subtotal do item', async () => {
      const item = { productId: 'prod-1', quantity: 3 };
      const product = { id: 'prod-1', name: 'Produto 1', price: 10 };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      await expect(resolver.subtotal(item as any)).resolves.toBe(30);
    });

    it('deve lançar NotFoundException se o produto não existir', async () => {
      const item = { productId: 'prod-inexistente', quantity: 1 };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(resolver.subtotal(item as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
