import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { CartService } from './cart.service';
import { Cart } from './schemas/cart.schema';
import { Product } from '../product/schemas/product.schema';

// tipo auxiliar reutilizável para os mocks de item do carrinho
type CartItemMock = { productId: Types.ObjectId; quantity: number };

describe('CartService', () => {
  let service: CartService;

  const mockCartModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockProductModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getModelToken(Cart.name),
          useValue: mockCartModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // =========================================================
  // findOrCreate
  // =========================================================

  describe('findOrCreate', () => {
    it('deve retornar o carrinho existente', async () => {
      const userId = new Types.ObjectId().toString();

      const cart = {
        userId: new Types.ObjectId(userId),
        items: [] as { productId: Types.ObjectId; quantity: number }[],
        save: jest.fn().mockResolvedValue(true),
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      const result = await service.findOrCreate(userId);

      expect(result).toEqual(cart);
      expect(mockCartModel.findOne).toHaveBeenCalled();
      expect(mockCartModel.create).not.toHaveBeenCalled();
    });

    it('deve criar um novo carrinho quando não existir', async () => {
      const userId = new Types.ObjectId().toString();

      const newCart = {
        userId: new Types.ObjectId(userId),
        items: [],
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      mockCartModel.create.mockResolvedValue(newCart);

      const result = await service.findOrCreate(userId);

      expect(result).toEqual(newCart);
      expect(mockCartModel.create).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
        items: [],
      });
    });
  });

  // =========================================================
  // addToCart
  // =========================================================

  describe('addToCart', () => {
    it('deve adicionar um novo produto ao carrinho', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId().toString();

      const product = {
        _id: new Types.ObjectId(productId),
        stock: 10,
      };

      const cart = {
        userId: new Types.ObjectId(userId),
        items: [] as { productId: Types.ObjectId; quantity: number }[],
        save: jest.fn().mockResolvedValue(true),
      };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      const result = await service.addToCart(userId, productId, 2);

      expect(result).toBe(cart);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId.toString()).toBe(productId);
      expect(cart.items[0].quantity).toBe(2);

      expect(cart.save).toHaveBeenCalled();
    });

    it('deve aumentar a quantidade de um produto já existente no carrinho', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId().toString();

      const product = {
        _id: new Types.ObjectId(productId),
        stock: 10,
      };

      const cart = {
        userId: new Types.ObjectId(userId),
        items: [
          {
            productId: new Types.ObjectId(productId),
            quantity: 2,
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      const result = await service.addToCart(userId, productId, 3);

      expect(result).toBe(cart);
      expect(cart.items[0].quantity).toBe(5);
      expect(cart.save).toHaveBeenCalled();
    });

    it('deve rejeitar quantidade menor ou igual a zero', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId().toString();

      await expect(service.addToCart(userId, productId, 0)).rejects.toThrow(
        new BadRequestException('A quantidade deve ser maior que zero'),
      );

      expect(mockProductModel.findById).not.toHaveBeenCalled();
    });

    it('deve rejeitar ID de produto inválido', async () => {
      const userId = new Types.ObjectId().toString();

      await expect(service.addToCart(userId, 'id-invalido', 1)).rejects.toThrow(
        new BadRequestException('ID do produto inválido'),
      );

      expect(mockProductModel.findById).not.toHaveBeenCalled();
    });

    it('deve rejeitar produto inexistente', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId().toString();

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.addToCart(userId, productId, 1)).rejects.toThrow(
        new NotFoundException('Produto não encontrado'),
      );
    });

    it('deve rejeitar quantidade maior que o estoque', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId().toString();

      const product = {
        _id: new Types.ObjectId(productId),
        stock: 5,
      };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      await expect(service.addToCart(userId, productId, 6)).rejects.toThrow(
        new BadRequestException(
          'Quantidade solicitada maior que o estoque disponível',
        ),
      );
    });

    it('deve rejeitar quando a quantidade total do produto ultrapassar o estoque', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId().toString();

      const product = {
        _id: new Types.ObjectId(productId),
        stock: 5,
      };

      const cart = {
        userId: new Types.ObjectId(userId),
        items: [
          {
            productId: new Types.ObjectId(productId),
            quantity: 4,
          },
        ],
        save: jest.fn(),
      };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      await expect(service.addToCart(userId, productId, 2)).rejects.toThrow(
        new BadRequestException(
          'Quantidade total no carrinho maior que o estoque disponível',
        ),
      );

      expect(cart.save).not.toHaveBeenCalled();
    });
  });

  // =========================================================
  // updateCartItem
  // =========================================================

  describe('updateCartItem', () => {
    it('deve atualizar a quantidade de um produto no carrinho', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId().toString();

      const product = {
        _id: new Types.ObjectId(productId),
        stock: 10,
      };

      const cart = {
        userId: new Types.ObjectId(userId),
        items: [
          {
            productId: new Types.ObjectId(productId),
            quantity: 2,
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      const result = await service.updateCartItem(userId, productId, 5);

      expect(result).toBe(cart);
      expect(cart.items[0].quantity).toBe(5);
      expect(cart.save).toHaveBeenCalled();
    });

    it('deve rejeitar quantidade menor ou igual a zero', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId().toString();

      await expect(
        service.updateCartItem(userId, productId, 0),
      ).rejects.toThrow(
        new BadRequestException('A quantidade deve ser maior que zero'),
      );
    });

    it('deve rejeitar ID de produto inválido', async () => {
      const userId = new Types.ObjectId().toString();

      await expect(
        service.updateCartItem(userId, 'id-invalido', 1),
      ).rejects.toThrow(new BadRequestException('ID do produto inválido'));
    });

    it('deve rejeitar produto inexistente', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId().toString();

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateCartItem(userId, productId, 1),
      ).rejects.toThrow(new NotFoundException('Produto não encontrado'));
    });

    it('deve rejeitar quantidade maior que o estoque', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId().toString();

      const product = {
        _id: new Types.ObjectId(productId),
        stock: 5,
      };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      await expect(
        service.updateCartItem(userId, productId, 6),
      ).rejects.toThrow(
        new BadRequestException(
          'Quantidade solicitada maior que o estoque disponível',
        ),
      );
    });

    it('deve rejeitar quando o carrinho não existir', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId().toString();

      const product = {
        _id: new Types.ObjectId(productId),
        stock: 10,
      };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateCartItem(userId, productId, 1),
      ).rejects.toThrow(new NotFoundException('Carrinho não encontrado'));
    });

    it('deve rejeitar quando o produto não estiver no carrinho', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId().toString();

      const otherProductId = new Types.ObjectId();

      const product = {
        _id: new Types.ObjectId(productId),
        stock: 10,
      };

      const cart = {
        userId: new Types.ObjectId(userId),
        items: [
          {
            productId: otherProductId,
            quantity: 2,
          },
        ],
        save: jest.fn(),
      };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      await expect(
        service.updateCartItem(userId, productId, 1),
      ).rejects.toThrow(
        new NotFoundException('Produto não encontrado no carrinho'),
      );

      expect(cart.save).not.toHaveBeenCalled();
    });
  });

  // =========================================================
  // removeFromCart
  // =========================================================

  describe('removeFromCart', () => {
    it('deve remover um produto do carrinho', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId().toString();
      const otherProductId = new Types.ObjectId();

      const cart = {
        userId: new Types.ObjectId(userId),
        items: [
          {
            productId: new Types.ObjectId(productId),
            quantity: 2,
          },
          {
            productId: otherProductId,
            quantity: 1,
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      const result = await service.removeFromCart(userId, productId);

      expect(result).toBe(cart);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toEqual(otherProductId);
      expect(cart.save).toHaveBeenCalled();
    });

    it('deve rejeitar ID de produto inválido', async () => {
      const userId = new Types.ObjectId().toString();

      await expect(
        service.removeFromCart(userId, 'id-invalido'),
      ).rejects.toThrow(new BadRequestException('ID do produto inválido'));

      expect(mockCartModel.findOne).not.toHaveBeenCalled();
    });

    it('deve rejeitar quando o carrinho não existir', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId().toString();

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.removeFromCart(userId, productId)).rejects.toThrow(
        new NotFoundException('Carrinho não encontrado'),
      );
    });

    it('deve rejeitar quando o produto não estiver no carrinho', async () => {
      const userId = new Types.ObjectId().toString();
      const productId = new Types.ObjectId().toString();

      const cart = {
        userId: new Types.ObjectId(userId),
        items: [],
        save: jest.fn(),
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      await expect(service.removeFromCart(userId, productId)).rejects.toThrow(
        new NotFoundException('Produto não encontrado no carrinho'),
      );

      expect(cart.save).not.toHaveBeenCalled();
    });
  });

  // =========================================================
  // clearCart
  // =========================================================

  describe('clearCart', () => {
    it('deve limpar todos os produtos do carrinho', async () => {
      const userId = new Types.ObjectId().toString();

      const cart = {
        userId: new Types.ObjectId(userId),
        items: [
          {
            productId: new Types.ObjectId(),
            quantity: 2,
          },
          {
            productId: new Types.ObjectId(),
            quantity: 1,
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cart),
      });

      const result = await service.clearCart(userId);

      expect(result).toBe(cart);
      expect(cart.items).toEqual([]);
      expect(cart.save).toHaveBeenCalled();
    });

    it('deve rejeitar quando o carrinho não existir', async () => {
      const userId = new Types.ObjectId().toString();

      mockCartModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.clearCart(userId)).rejects.toThrow(
        new NotFoundException('Carrinho não encontrado'),
      );
    });
  });
});
