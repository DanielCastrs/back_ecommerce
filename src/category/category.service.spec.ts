import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { CategoryService } from './category.service';
import { Category } from './schemas/category.schema';
import { Product } from '../product/schemas/product.schema';

describe('CategoryService', () => {
  let service: CategoryService;

  const mockCategoryModel: any = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(data),
  }));

  mockCategoryModel.find = jest.fn();
  mockCategoryModel.findById = jest.fn();
  mockCategoryModel.findOne = jest.fn();
  mockCategoryModel.findByIdAndUpdate = jest.fn();
  mockCategoryModel.findByIdAndDelete = jest.fn();
  mockCategoryModel.deleteOne = jest.fn();

  const mockProductModel = {
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,

        {
          provide: getModelToken(Category.name),
          useValue: mockCategoryModel,
        },

        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar todas as categorias', async () => {
    const categories = [
      {
        id: '1',
        name: 'Eletrônicos',
      },
      {
        id: '2',
        name: 'Informática',
      },
    ];

    mockCategoryModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(categories),
    });

    const result = await service.findAll();

    expect(result).toEqual(categories);

    expect(mockCategoryModel.find).toHaveBeenCalled();
  });

  it('deve retornar uma categoria pelo id', async () => {
    const categoryId = '507f1f77bcf86cd799439011';

    const category = {
      id: categoryId,
      name: 'Eletrônicos',
    };

    mockCategoryModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(category),
    });

    const result = await service.findCategory(categoryId);

    expect(result).toEqual(category);

    expect(mockCategoryModel.findById).toHaveBeenCalledWith(categoryId);
  });

  it('deve lançar erro quando a categoria não existir', async () => {
    const categoryId = '507f1f77bcf86cd799439011';

    mockCategoryModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.findCategory(categoryId)).rejects.toThrow(
      'Categoria não encontrada',
    );
  });

  it('deve criar uma categoria', async () => {
    const input = {
      name: 'Eletrônicos',
    };

    mockCategoryModel.findOne.mockResolvedValue(null);

    const result = await service.create(input);

    expect(result).toEqual(
      expect.objectContaining({
        name: 'Eletrônicos',
      }),
    );

    expect(mockCategoryModel.findOne).toHaveBeenCalled();

    expect(mockCategoryModel).toHaveBeenCalledWith({
      name: 'Eletrônicos',
    });
  });

  it('deve impedir a criação de categoria duplicada', async () => {
    const input = {
      name: 'Eletrônicos',
    };

    mockCategoryModel.findOne.mockResolvedValue({
      _id: '123',
      name: 'Eletrônicos',
    });

    await expect(service.create(input)).rejects.toThrow(
      'Categoria já cadastrada',
    );

    expect(mockCategoryModel).not.toHaveBeenCalled();
  });

  it('deve atualizar uma categoria', async () => {
    const categoryId = '507f1f77bcf86cd799439011';

    const input = {
      name: 'Eletrônicos Atualizados',
      description: 'Produtos eletrônicos',
    };

    const updatedCategory = {
      id: categoryId,
      ...input,
    };

    mockCategoryModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updatedCategory),
    });

    const result = await service.update(categoryId, input);

    expect(result).toEqual(updatedCategory);

    expect(mockCategoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
      categoryId,
      input,
      {
        new: true,
        runValidators: true,
      },
    );
  });

  it('deve lançar erro ao atualizar categoria inexistente', async () => {
    const categoryId = '507f1f77bcf86cd799439011';

    const input = {
      name: 'Eletrônicos',
    };

    mockCategoryModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.update(categoryId, input)).rejects.toThrow(
      'Categoria não encontrada',
    );
  });

  it('deve lançar erro ao atualizar categoria inexistente', async () => {
    const categoryId = '507f1f77bcf86cd799439011';

    const input = {
      name: 'Eletrônicos',
    };

    mockCategoryModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.update(categoryId, input)).rejects.toThrow(
      'Categoria não encontrada',
    );
  });

  it('deve lançar erro ao deletar categoria inexistente', async () => {
    const categoryId = '507f1f77bcf86cd799439011';

    mockCategoryModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.delete(categoryId)).rejects.toThrow(
      'Categoria não encontrada',
    );
  });

  it('deve remover categoria que não possui produtos', async () => {
    const categoryId = '507f1f77bcf86cd799439011';

    const category = {
      _id: categoryId,
      name: 'Eletrônicos',
    };

    mockCategoryModel.findById.mockResolvedValue(category);

    mockProductModel.countDocuments.mockResolvedValue(0);

    mockCategoryModel.deleteOne.mockResolvedValue({
      deletedCount: 1,
    });

    const result = await service.remove(categoryId);

    expect(result).toBe(true);

    expect(mockCategoryModel.findById).toHaveBeenCalledWith(categoryId);

    expect(mockProductModel.countDocuments).toHaveBeenCalledWith({
      categoryId: category._id,
    });

    expect(mockCategoryModel.deleteOne).toHaveBeenCalledWith({
      _id: categoryId,
    });
  });

  it('deve impedir a remoção de categoria que possui produtos', async () => {
    const categoryId = '507f1f77bcf86cd799439011';

    const category = {
      _id: categoryId,
      name: 'Eletrônicos',
    };

    mockCategoryModel.findById.mockResolvedValue(category);

    mockProductModel.countDocuments.mockResolvedValue(2);

    await expect(service.remove(categoryId)).rejects.toThrow(
      'Não é possível excluir a categoria porque existem produtos vinculados a ela',
    );

    expect(mockProductModel.countDocuments).toHaveBeenCalledWith({
      categoryId: category._id,
    });

    expect(mockCategoryModel.deleteOne).not.toHaveBeenCalled();
  });

  it('deve rejeitar ID de categoria inválido', async () => {
    const invalidId = '123';

    await expect(service.remove(invalidId)).rejects.toThrow(
      'ID da categoria inválido',
    );

    expect(mockCategoryModel.findById).not.toHaveBeenCalled();

    expect(mockProductModel.countDocuments).not.toHaveBeenCalled();

    expect(mockCategoryModel.deleteOne).not.toHaveBeenCalled();
  });

  it('deve lançar erro ao remover categoria inexistente', async () => {
    const categoryId = '507f1f77bcf86cd799439011';

    mockCategoryModel.findById.mockResolvedValue(null);

    await expect(service.remove(categoryId)).rejects.toThrow(
      'Categoria não encontrada',
    );

    expect(mockCategoryModel.findById).toHaveBeenCalledWith(categoryId);

    expect(mockProductModel.countDocuments).not.toHaveBeenCalled();

    expect(mockCategoryModel.deleteOne).not.toHaveBeenCalled();
  });
});
