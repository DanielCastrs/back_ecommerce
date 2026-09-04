import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

// mocka o módulo bcrypt inteiro — assim `bcrypt.compare` vira um jest.fn() controlável
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // =========================================================
  // login
  // =========================================================

  describe('login', () => {
    it('deve autenticar e retornar um accessToken quando credenciais forem válidas', async () => {
      const userId = 'user-id-123';

      const user = {
        _id: { toString: () => userId },
        email: 'teste@email.com',
        password: 'senha-hash',
        role: 'USER',
      };

      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('token-jwt-fake');

      const result = await service.login('teste@email.com', 'senha123');

      expect(result).toEqual({ accessToken: 'token-jwt-fake' });

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'teste@email.com',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith('senha123', 'senha-hash');

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: userId,
        email: user.email,
        role: user.role,
      });
    });

    it('deve rejeitar quando o usuário não for encontrado', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('naoexiste@email.com', 'senha123'),
      ).rejects.toThrow(UnauthorizedException);

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('deve rejeitar quando a senha estiver incorreta', async () => {
      const user = {
        _id: { toString: () => 'user-id-123' },
        email: 'teste@email.com',
        password: 'senha-hash',
        role: 'USER',
      };

      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('teste@email.com', 'senha-errada'),
      ).rejects.toThrow(new UnauthorizedException('senha inválidos'));

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('deve montar o payload do JWT com sub, email e role corretos', async () => {
      const user = {
        _id: { toString: () => 'outro-id-456' },
        email: 'admin@email.com',
        password: 'senha-hash',
        role: 'ADMIN',
      };

      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('token-admin');

      const result = await service.login('admin@email.com', 'senha123');

      expect(result.accessToken).toBe('token-admin');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: 'outro-id-456',
        email: 'admin@email.com',
        role: 'ADMIN',
      });
    });
  });
});
