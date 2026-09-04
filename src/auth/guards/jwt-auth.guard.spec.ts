import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtAuthGuard } from './jwt-auth.guard';
import { GqlExecutionContext } from '@nestjs/graphql';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockRequest: any = {
    headers: {},
  };

  const mockContext = {} as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);

    jest.clearAllMocks();

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: () => ({ req: mockRequest }),
    } as any);
  });

  it('deve estar definido', () => {
    expect(guard).toBeDefined();
  });

  it('deve rejeitar quando o token não for informado', async () => {
    mockRequest.headers = {};

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      new UnauthorizedException('Token não informado'),
    );
  });

  it('deve rejeitar quando o formato do token for inválido', async () => {
    mockRequest.headers = {
      authorization: 'Basic token-123',
    };

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      new UnauthorizedException('Formato do token inválido'),
    );
  });

  it('deve rejeitar quando o Bearer não possuir token', async () => {
    mockRequest.headers = {
      authorization: 'Bearer',
    };

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      new UnauthorizedException('Formato do token inválido'),
    );
  });

  it('deve validar o token e adicionar o usuário na request', async () => {
    const payload = {
      sub: 'user-123',
      email: 'daniel@email.com',
      role: 'CUSTOMER',
    };

    mockRequest.headers = {
      authorization: 'Bearer token-valido',
    };

    mockJwtService.verifyAsync.mockResolvedValue(payload);

    await expect(guard.canActivate(mockContext)).resolves.toBe(true);

    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('token-valido');
    expect(mockRequest.user).toEqual(payload);
  });

  it('deve rejeitar quando o token for inválido ou expirado', async () => {
    mockRequest.headers = {
      authorization: 'Bearer token-invalido',
    };

    mockJwtService.verifyAsync.mockRejectedValue(new Error());

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      new UnauthorizedException('Token inválido ou expirado'),
    );
  });
});
