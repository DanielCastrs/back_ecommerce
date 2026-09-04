import { Test, TestingModule } from '@nestjs/testing';
import { CategoryResolver } from './category.resolver';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('CategoryResolver', () => {
  let resolver: CategoryResolver;

  const mockCategoryService = {
    findAll: jest.fn(),
    findCategory: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryResolver,
        { provide: CategoryService, useValue: mockCategoryService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<CategoryResolver>(CategoryResolver);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('categories', () => {
    it('deve retornar todas as categorias', async () => {
      const categories = [{ id: 'cat-1', name: 'Categoria 1' }];

      mockCategoryService.findAll.mockResolvedValue(categories);

      await expect(resolver.categories()).resolves.toEqual(categories);

      expect(mockCategoryService.findAll).toHaveBeenCalled();
    });
  });

  describe('category', () => {
    it('deve buscar categoria pelo ID', async () => {
      const category = { id: 'cat-1', name: 'Categoria 1' };

      mockCategoryService.findCategory.mockResolvedValue(category);

      await expect(resolver.category('cat-1')).resolves.toEqual(category);

      expect(mockCategoryService.findCategory).toHaveBeenCalledWith('cat-1');
    });
  });

  describe('createCategory', () => {
    it('deve criar categoria', async () => {
      const input = { name: 'Categoria Nova' };

      const category = { id: 'cat-1', ...input };

      mockCategoryService.create.mockResolvedValue(category);

      await expect(resolver.createCategory(input as any)).resolves.toEqual(
        category,
      );

      expect(mockCategoryService.create).toHaveBeenCalledWith(input);
    });
  });

  describe('deleteCategory', () => {
    it('deve remover categoria pelo ID', async () => {
      const category = { id: 'cat-1', name: 'Categoria 1' };

      mockCategoryService.delete.mockResolvedValue(category);

      await expect(resolver.deleteCategory('cat-1')).resolves.toEqual(category);

      expect(mockCategoryService.delete).toHaveBeenCalledWith('cat-1');
    });
  });

  describe('updateCategory', () => {
    it('deve atualizar categoria separando o ID dos dados', async () => {
      const input = { id: 'cat-1', name: 'Categoria Atualizada' };

      const category = { ...input };

      mockCategoryService.update.mockResolvedValue(category);

      await expect(resolver.updateCategory(input as any)).resolves.toEqual(
        category,
      );

      expect(mockCategoryService.update).toHaveBeenCalledWith('cat-1', {
        name: 'Categoria Atualizada',
      });
    });
  });
});
