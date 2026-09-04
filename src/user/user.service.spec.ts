import * as bcrypt from 'bcrypt';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { UserService } from './user.service';
import { User } from './schemas/user.schema';

describe('UserService', () => {
  let service: UserService;

  const mockUserModel: any = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(data),
  }));

  mockUserModel.find = jest.fn();
  mockUserModel.findOne = jest.fn();
  mockUserModel.findById = jest.fn();
  mockUserModel.findByIdAndUpdate = jest.fn();
  mockUserModel.findByIdAndDelete = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar um usuário', async () => {
    const input = {
      name: 'Daniel Castro',
      email: 'daniel@email.com',
      password: '123456',
    };

    mockUserModel.findOne.mockResolvedValue(null);

    const result = await service.create(input);

    expect(result).toEqual(
      expect.objectContaining({
        name: 'Daniel Castro',
        email: 'daniel@email.com',
      }),
    );

    expect(result.password).not.toBe('123456');

    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      email: 'daniel@email.com',
    });

    expect(mockUserModel).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Daniel Castro',
        email: 'daniel@email.com',
        password: expect.any(String),
      }),
    );
  });

  it('deve normalizar nome e email ao criar usuário', async () => {
    const input = {
      name: '  Daniel Castro  ',
      email: '  DANIEL@EMAIL.COM  ',
      password: '123456',
    };

    mockUserModel.findOne.mockResolvedValue(null);

    await service.create(input);

    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      email: 'daniel@email.com',
    });

    expect(mockUserModel).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Daniel Castro',
        email: 'daniel@email.com',
      }),
    );
  });

  it('deve impedir a criação de usuário com email duplicado', async () => {
    const input = {
      name: 'Daniel Castro',
      email: 'daniel@email.com',
      password: '123456',
    };

    mockUserModel.findOne.mockResolvedValue({
      _id: '123',
      name: 'Outro Usuário',
      email: 'daniel@email.com',
    });

    await expect(service.create(input)).rejects.toThrow('Email já cadastrado');

    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      email: 'daniel@email.com',
    });

    expect(mockUserModel).not.toHaveBeenCalled();
  });

  it('deve retornar todos os usuários', async () => {
    const users = [
      {
        id: '1',
        name: 'Daniel',
        email: 'daniel@email.com',
      },
      {
        id: '2',
        name: 'João',
        email: 'joao@email.com',
      },
    ];

    mockUserModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(users),
    });

    const result = await service.findAll();

    expect(result).toEqual(users);

    expect(mockUserModel.find).toHaveBeenCalled();
  });

  it('deve retornar um usuário pelo id', async () => {
    const userId = '507f1f77bcf86cd799439011';

    const user = {
      id: userId,
      name: 'Daniel Castro',
      email: 'daniel@email.com',
    };

    mockUserModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(user),
    });

    const result = await service.findById(userId);

    expect(result).toEqual(user);

    expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
  });

  it('deve rejeitar ID de usuário inválido', async () => {
    const invalidId = '123';

    await expect(service.findById(invalidId)).rejects.toThrow(
      'ID do usuário inválido',
    );

    expect(mockUserModel.findById).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando o usuário não existir', async () => {
    const userId = '507f1f77bcf86cd799439011';

    mockUserModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.findById(userId)).rejects.toThrow(
      'Usuário não encontrado',
    );

    expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
  });
  it('deve atualizar um usuário', async () => {
    const userId = '507f1f77bcf86cd799439011';

    const input = {
      name: 'Daniel Castro Atualizado',
      email: 'novo@email.com',
    };

    const updatedUser = {
      id: userId,
      name: 'Daniel Castro Atualizado',
      email: 'novo@email.com',
    };

    mockUserModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updatedUser),
    });

    const result = await service.update(userId, input);

    expect(result).toEqual(updatedUser);

    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      input,
      {
        new: true,
        runValidators: true,
      },
    );
  });

  it('deve fazer hash da senha ao atualizar usuário', async () => {
    const userId = '507f1f77bcf86cd799439011';

    const input = {
      password: 'novaSenha123',
    };

    const updatedUser = {
      id: userId,
      name: 'Daniel Castro',
      email: 'daniel@email.com',
      password: 'hash-da-senha',
    };

    mockUserModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updatedUser),
    });

    const result = await service.update(userId, input);

    expect(result).toEqual(updatedUser);

    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        password: expect.not.stringMatching(/^novaSenha123$/),
      }),
      {
        new: true,
        runValidators: true,
      },
    );
  });

  it('deve rejeitar ID inválido ao atualizar usuário', async () => {
    const invalidId = '123';

    const input = {
      name: 'Daniel Atualizado',
    };

    await expect(service.update(invalidId, input)).rejects.toThrow(
      'ID do usuário inválido',
    );

    expect(mockUserModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('deve lançar erro ao atualizar usuário inexistente', async () => {
    const userId = '507f1f77bcf86cd799439011';

    const input = {
      name: 'Daniel Atualizado',
    };

    mockUserModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.update(userId, input)).rejects.toThrow(
      'Usuário não encontrado',
    );

    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      input,
      {
        new: true,
        runValidators: true,
      },
    );
  });

  it('deve remover um usuário', async () => {
    const userId = '507f1f77bcf86cd799439011';

    const user = {
      id: userId,
      name: 'Daniel Castro',
      email: 'daniel@email.com',
    };

    mockUserModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(user),
    });

    const result = await service.remove(userId);

    expect(result).toEqual(user);

    expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
  });

  it('deve rejeitar ID inválido ao remover usuário', async () => {
    const invalidId = '123';

    await expect(service.remove(invalidId)).rejects.toThrow(
      'ID do usuário inválido',
    );

    expect(mockUserModel.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('deve lançar erro ao remover usuário inexistente', async () => {
    const userId = '507f1f77bcf86cd799439011';

    mockUserModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.remove(userId)).rejects.toThrow(
      'Usuário não encontrado',
    );

    expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
  });

  it('deve encontrar um usuário pelo email', async () => {
    const email = 'daniel@email.com';

    const user = {
      id: '507f1f77bcf86cd799439011',
      name: 'Daniel Castro',
      email,
    };

    mockUserModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(user),
    });

    const result = await service.findByEmail(email);

    expect(result).toEqual(user);

    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      email,
    });
  });

  it('deve retornar null quando o email não existir', async () => {
    const email = 'inexistente@email.com';

    mockUserModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const result = await service.findByEmail(email);

    expect(result).toBeNull();

    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      email,
    });
  });

  it('deve retornar usuário sem a senha', async () => {
    const userId = '507f1f77bcf86cd799439011';

    const user = {
      id: userId,
      name: 'Daniel Castro',
      email: 'daniel@email.com',
    };

    const selectMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(user),
    });

    mockUserModel.findById.mockReturnValue({
      select: selectMock,
    });

    const result = await service.findByIdWithoutPassword(userId);

    expect(result).toEqual(user);

    expect(mockUserModel.findById).toHaveBeenCalledWith(userId);

    expect(selectMock).toHaveBeenCalledWith('-password');
  });

  it('deve rejeitar ID inválido ao buscar usuário sem senha', async () => {
    const invalidId = '123';

    await expect(service.findByIdWithoutPassword(invalidId)).rejects.toThrow(
      'ID do usuário inválido',
    );

    expect(mockUserModel.findById).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando o usuário não existir ao buscar sem senha', async () => {
    const userId = '507f1f77bcf86cd799439011';

    const selectMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    mockUserModel.findById.mockReturnValue({
      select: selectMock,
    });

    await expect(service.findByIdWithoutPassword(userId)).rejects.toThrow(
      'Usuário não encontrado',
    );

    expect(mockUserModel.findById).toHaveBeenCalledWith(userId);

    expect(selectMock).toHaveBeenCalledWith('-password');
  });

  it('deve gerar um hash válido para a senha ao criar usuário', async () => {
    const input = {
      name: 'Daniel Castro',
      email: 'daniel@email.com',
      password: '123456',
    };

    mockUserModel.findOne.mockResolvedValue(null);

    const result = await service.create(input);

    const passwordIsValid = await bcrypt.compare(
      input.password,
      result.password,
    );

    expect(passwordIsValid).toBe(true);
  });

  it('deve gerar um hash válido ao atualizar a senha', async () => {
    const userId = '507f1f77bcf86cd799439011';

    const input = {
      password: 'novaSenha123',
    };

    mockUserModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        id: userId,
        name: 'Daniel Castro',
        email: 'daniel@email.com',
      }),
    });

    await service.update(userId, input);

    const updateCall =
      mockUserModel.findByIdAndUpdate.mock.calls[
        mockUserModel.findByIdAndUpdate.mock.calls.length - 1
      ];

    const updateData = updateCall[1];

    const passwordIsValid = await bcrypt.compare(
      input.password,
      updateData.password,
    );

    expect(passwordIsValid).toBe(true);
  });
});
