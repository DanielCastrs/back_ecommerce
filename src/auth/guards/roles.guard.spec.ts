import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { RolesGuard } from './roles.guard';
import { UserRole } from '../../user/enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockRequest: any = {
    user: undefined,
  };

  const mockContext = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: mockReflector }],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);

    jest.clearAllMocks();

    mockRequest.user = undefined;

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: () => ({
        req: mockRequest,
      }),
    } as any);
  });

  it('deve estar definido', () => {
    expect(guard).toBeDefined();
  });

  it('deve permitir acesso quando a rota não possui roles', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('deve rejeitar quando não houver usuário autenticado', () => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    mockRequest.user = undefined;

    expect(() => guard.canActivate(mockContext)).toThrow(
      new ForbiddenException('Usuário não autenticado'),
    );
  });

  it('deve permitir acesso quando o usuário possuir a role exigida', () => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    mockRequest.user = {
      sub: 'user-123',
      email: 'admin@email.com',
      role: UserRole.ADMIN,
    };

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('deve rejeitar quando o usuário não possuir a role exigida', () => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    mockRequest.user = {
      sub: 'user-123',
      email: 'user@email.com',
      role: UserRole.USER,
    };

    expect(() => guard.canActivate(mockContext)).toThrow(
      new ForbiddenException(
        'Você não possui permissão para acessar este recurso',
      ),
    );
  });

  it('deve consultar as roles do handler e da classe', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    guard.canActivate(mockContext);

    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
  });
});
