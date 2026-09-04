import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('UserResolver', () => {
  let resolver: UserResolver;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByIdWithoutPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<UserResolver>(UserResolver);
    jest.clearAllMocks();
  });

  // ... resto dos testes continua igual

  it('deve estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('createUser', () => {
    it('deve criar usuário', async () => {
      const input = {
        name: 'Daniel',
        email: 'daniel@email.com',
        password: '123456',
      };

      const user = { id: '1', ...input };

      mockUserService.create.mockResolvedValue(user);

      await expect(resolver.createUser(input)).resolves.toEqual(user);

      expect(mockUserService.create).toHaveBeenCalledWith(input);
    });
  });

  describe('users', () => {
    it('deve retornar todos os usuários', async () => {
      const users = [{ id: '1', name: 'Daniel' }];

      mockUserService.findAll.mockResolvedValue(users);

      await expect(resolver.users()).resolves.toEqual(users);

      expect(mockUserService.findAll).toHaveBeenCalled();
    });
  });

  describe('user', () => {
    it('deve buscar usuário pelo ID', async () => {
      const user = { id: '1', name: 'Daniel' };

      mockUserService.findById.mockResolvedValue(user);

      await expect(resolver.user('1')).resolves.toEqual(user);

      expect(mockUserService.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('updateUser', () => {
    it('deve atualizar usuário separando o ID dos dados', async () => {
      const input = {
        id: '1',
        name: 'Daniel Atualizado',
        email: 'novo@email.com',
      };

      const user = { ...input };

      mockUserService.update.mockResolvedValue(user);

      await expect(resolver.updateUser(input)).resolves.toEqual(user);

      expect(mockUserService.update).toHaveBeenCalledWith('1', {
        name: 'Daniel Atualizado',
        email: 'novo@email.com',
      });
    });
  });

  describe('deleteUser', () => {
    it('deve remover usuário pelo ID', async () => {
      const user = { id: '1', name: 'Daniel' };

      mockUserService.remove.mockResolvedValue(user);

      await expect(resolver.deleteUser('1')).resolves.toEqual(user);

      expect(mockUserService.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('me', () => {
    it('deve buscar o usuário autenticado sem senha', async () => {
      const currentUser = {
        sub: 'user-123',
        email: 'daniel@email.com',
      };

      const user = {
        id: 'user-123',
        name: 'Daniel',
        email: 'daniel@email.com',
      };

      mockUserService.findByIdWithoutPassword.mockResolvedValue(user);

      await expect(resolver.me(currentUser)).resolves.toEqual(user);

      expect(mockUserService.findByIdWithoutPassword).toHaveBeenCalledWith(
        'user-123',
      );
    });
  });

  describe('updateMyProfile', () => {
    it('deve atualizar o perfil do usuário autenticado', async () => {
      const currentUser = {
        sub: 'user-123',
        email: 'daniel@email.com',
      };

      const input = {
        name: 'Daniel Atualizado',
      };

      const user = {
        id: 'user-123',
        ...input,
      };

      mockUserService.update.mockResolvedValue(user);

      await expect(
        resolver.updateMyProfile(currentUser, input),
      ).resolves.toEqual(user);

      expect(mockUserService.update).toHaveBeenCalledWith('user-123', input);
    });
  });
});
