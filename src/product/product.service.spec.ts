import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { Product } from './schemas/product.schema';
import { Category } from '../category/schemas/category.schema';

describe('ProductService', () => {
  let service: ProductService;

  // mock do productModel: precisa funcionar como "new this.productModel(data)"
  // e também ter métodos estáticos como find, findById etc.
  const mockProductModel: any = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(data),
  }));
  mockProductModel.find = jest.fn();
  mockProductModel.findById = jest.fn();
  mockProductModel.findByIdAndUpdate = jest.fn();
  mockProductModel.findByIdAndDelete = jest.fn();

  const mockCategoryModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: getModelToken(Category.name),
          useValue: mockCategoryModel,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar todos os produtos', async () => {
    const products = [
      {
        id: '1',
        name: 'Notebook',
        price: 3500,
        stock: 10,
      },
      {
        id: '2',
        name: 'Mouse',
        price: 100,
        stock: 20,
      },
    ];

    mockProductModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(products),
    });

    const result = await service.findAll();

    expect(result).toEqual(products);

    expect(mockProductModel.find).toHaveBeenCalled();
  });

  it('deve retornar um produto pelo id', async () => {
    const product = {
      id: '123',
      name: 'Notebook',
      price: 3500,
      stock: 10,
    };

    mockProductModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(product),
    });

    const result = await service.findById('507f1f77bcf86cd799439011');

    expect(result).toEqual(product);

    expect(mockProductModel.findById).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
    );
  });

  it('deve lançar erro quando o produto não existir', async () => {
    mockProductModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.findById('507f1f77bcf86cd799439011'),
    ).rejects.toThrow();
  });

  it('deve criar um produto', async () => {
    const input = {
      name: 'Notebook Dell',
      price: 4500,
      stock: 10,
      description: 'Notebook para estudos',
      categoryId: '123456789012345678901234',
    };

    mockCategoryModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: input.categoryId,
        name: 'Eletrônicos',
      }),
    });

    const result = await service.create(input);

    expect(result).toEqual(
      expect.objectContaining({
        name: 'Notebook Dell',
        price: 4500,
        stock: 10,
        description: 'Notebook para estudos',
      }),
    );

    expect(mockProductModel).toHaveBeenCalled();
  });

  it('deve lançar erro ao criar produto com categoria inexistente', async () => {
    const input = {
      name: 'Notebook Dell',
      price: 4500,
      stock: 10,
      description: 'Notebook para estudos',
      categoryId: '123456789012345678901234',
    };

    mockCategoryModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.create(input)).rejects.toThrow();
  });

  it('deve deletar um produto', async () => {
    const product = {
      id: '123',
      name: 'Notebook',
      price: 3500,
      stock: 10,
    };

    mockProductModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(product),
    });

    mockProductModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(product),
    });

    const result = await service.delete('123');

    expect(result).toEqual(product);

    expect(mockProductModel.findByIdAndDelete).toHaveBeenCalledWith('123');
  });

  it('deve lançar erro ao deletar produto inexistente', async () => {
    mockProductModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.delete('123')).rejects.toThrow(
      'Produto não encontrado',
    );
  });

  it('deve atualizar um produto', async () => {
    const productId = '507f1f77bcf86cd799439011';

    const input = {
      name: 'Notebook Dell Atualizado',
      price: 5000,
      stock: 8,
    };

    const updatedProduct = {
      id: productId,
      ...input,
    };

    mockProductModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updatedProduct),
    });

    const result = await service.update(productId, input);

    expect(result).toEqual(updatedProduct);

    expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
      productId,
      input,
      {
        new: true,
        runValidators: true,
      },
    );
  });

  it('deve atualizar o produto e validar a categoria', async () => {
    const productId = '507f1f77bcf86cd799439011';

    const categoryId = '507f1f77bcf86cd799439012';

    const input = {
      name: 'Notebook Dell',
      categoryId,
    };

    const category = {
      _id: categoryId,
      name: 'Eletrônicos',
    };

    const updatedProduct = {
      id: productId,
      name: 'Notebook Dell',
      categoryId,
    };

    mockCategoryModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(category),
    });

    mockProductModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updatedProduct),
    });

    const result = await service.update(productId, input);

    expect(result).toEqual(updatedProduct);

    expect(mockCategoryModel.findById).toHaveBeenCalledWith(categoryId);

    expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
      productId,
      input,
      {
        new: true,
        runValidators: true,
      },
    );
  });

  it('deve lançar erro ao atualizar com categoria inexistente', async () => {
    const productId = '507f1f77bcf86cd799439011';

    const categoryId = '507f1f77bcf86cd799439012';

    const input = {
      categoryId,
    };

    mockCategoryModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.update(productId, input)).rejects.toThrow(
      'Categoria não encontrada',
    );

    expect(mockProductModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('deve lançar erro ao atualizar produto inexistente', async () => {
    const productId = '507f1f77bcf86cd799439011';

    const input = {
      name: 'Notebook Atualizado',
    };

    mockProductModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.update(productId, input)).rejects.toThrow(
      'Produto não encontrado',
    );
  });
});
