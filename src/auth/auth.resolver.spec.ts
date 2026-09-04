import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(resolver).toBeDefined();
  });

  describe('login', () => {
    it('deve autenticar o usuário e retornar o token', async () => {
      const input = {
        email: 'daniel@email.com',
        password: '123456',
      };

      const authResponse = {
        accessToken: 'token-fake',
        user: { id: '1', email: input.email },
      };

      mockAuthService.login.mockResolvedValue(authResponse);

      await expect(resolver.login(input as any)).resolves.toEqual(authResponse);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        input.email,
        input.password,
      );
    });
  });
});
