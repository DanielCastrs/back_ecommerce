import {
  Injectable,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/mongoose';

import {
  Model,
} from 'mongoose';

import {
  User,
  UserDocument,
} from './schemas/user.schema';

import { NotFoundException, BadRequestException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: {
    name: string;
    email: string;
    password: string;
  }) {
    const user = new this.userModel(data);

    return user.save();
  }
  async findAll() {
  return this.userModel.find().exec();
}
async findById(id: string) {
  if (!isValidObjectId(id)) {
    throw new BadRequestException(
      'ID do usuário inválido',
    );
  }

  const user = await this.userModel
    .findById(id)
    .exec();

  if (!user) {
    throw new NotFoundException(
      'Usuário não encontrado',
    );
  }

  return user;
}
async update(
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
  },
) {
  if (!isValidObjectId(id)) {
    throw new BadRequestException(
      'ID do usuário inválido',
    );
  }

  const user = await this.userModel
    .findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      },
    )
    .exec();

  if (!user) {
    throw new NotFoundException(
      'Usuário não encontrado',
    );
  }

  return user;
}
async remove(id: string) {
  if (!isValidObjectId(id)) {
    throw new BadRequestException(
      'ID do usuário inválido',
    );
  }

  const user = await this.userModel
    .findByIdAndDelete(id)
    .exec();

  if (!user) {
    throw new NotFoundException(
      'Usuário não encontrado',
    );
  }

  return user;
}
}