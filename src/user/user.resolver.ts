import { Args, Mutation, Resolver, Query, ID } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UserService } from './user.service';
import { UpdateUserInput } from './dto/update-user.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateMyProfileInput } from './dto/update-my-profile.input';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from './enums/user-role.enum';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserInput) {
    return this.userService.create(input);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  @Query(() => [User])
  users() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Query(() => User)
  user(@Args('id', { type: () => ID }) id: string) {
    return this.userService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => User)
  updateUser(@Args('input') input: UpdateUserInput) {
    const { id, ...data } = input;

    return this.userService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => User)
  deleteUser(@Args('id', { type: () => ID }) id: string) {
    return this.userService.remove(id);
  }
  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  me(@CurrentUser() user: { sub: string; email: string }) {
    return this.userService.findByIdWithoutPassword(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  updateMyProfile(
    @CurrentUser()
    user: {
      sub: string;
      email: string;
    },

    @Args('input')
    input: UpdateMyProfileInput,
  ) {
    return this.userService.update(user.sub, input);
  }
}
