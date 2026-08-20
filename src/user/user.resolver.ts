import { Args, Mutation, Resolver, Query, ID } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UserService } from './user.service';
import { UpdateUserInput } from './dto/update-user.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserInput) {
    return this.userService.create(input);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [User])
  users() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  user(@Args('id', { type: () => ID }) id: string) {
    return this.userService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  updateUser(@Args('input') input: UpdateUserInput) {
    const { id, ...data } = input;

    return this.userService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  deleteUser(@Args('id', { type: () => ID }) id: string) {
    return this.userService.remove(id);
  }
}
