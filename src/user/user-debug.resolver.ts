import { Args, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver()
export class UserDebugResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { nullable: true })
  async debugFindByEmail(@Args('email') email: string) {
    const user = await this.userService.findByEmail(email);
    console.log('debugFindByEmail recebeu:', email, '-> encontrou:', user);
    return user;
  }
}
