import { Test, TestingModule } from '@nestjs/testing';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('ProductResolver', () => {
  let resolver: ProductResolver;

  const mockProductService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findCategory: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductResolver,
        { provide: ProductService, useValue: mockProductService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<ProductResolver>(ProductResolver);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('products', () => {
    it('deve retornar todos os produtos', async () => {
      const products = [{ id: '1', name: 'Produto 1', categoryId: 'cat-1' }];

      mockProductService.findAll.mockResolvedValue(products);

      await expect(resolver.products()).resolves.toEqual(products);

      expect(mockProductService.findAll).toHaveBeenCalled();
    });
  });

  describe('product', () => {
    it('deve buscar produto pelo ID', async () => {
      const product = { id: '1', name: 'Produto 1', categoryId: 'cat-1' };

      mockProductService.findById.mockResolvedValue(product);

      await expect(resolver.product('1')).resolves.toEqual(product);

      expect(mockProductService.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('category', () => {
    it('deve resolver a categoria do produto', async () => {
      const product = { id: '1', name: 'Produto 1', categoryId: 'cat-1' };
      const category = { id: 'cat-1', name: 'Categoria 1' };

      mockProductService.findCategory.mockResolvedValue(category);

      await expect(resolver.category(product as any)).resolves.toEqual(
        category,
      );

      expect(mockProductService.findCategory).toHaveBeenCalledWith('cat-1');
    });
  });

  describe('createProduct', () => {
    it('deve criar produto', async () => {
      const input = {
        name: 'Produto Novo',
        price: 100,
        categoryId: 'cat-1',
      };

      const product = { id: '1', ...input };

      mockProductService.create.mockResolvedValue(product);

      await expect(resolver.createProduct(input as any)).resolves.toEqual(
        product,
      );

      expect(mockProductService.create).toHaveBeenCalledWith(input);
    });
  });

  describe('updateProduct', () => {
    it('deve atualizar produto separando o ID dos dados', async () => {
      const input = {
        id: '1',
        name: 'Produto Atualizado',
        price: 150,
      };

      const product = { ...input };

      mockProductService.update.mockResolvedValue(product);

      await expect(resolver.updateProduct(input as any)).resolves.toEqual(
        product,
      );

      expect(mockProductService.update).toHaveBeenCalledWith('1', {
        name: 'Produto Atualizado',
        price: 150,
      });
    });
  });

  describe('deleteProduct', () => {
    it('deve remover produto pelo ID', async () => {
      const product = { id: '1', name: 'Produto 1' };

      mockProductService.delete.mockResolvedValue(product);

      await expect(resolver.deleteProduct('1')).resolves.toEqual(product);

      expect(mockProductService.delete).toHaveBeenCalledWith('1');
    });
  });
});
