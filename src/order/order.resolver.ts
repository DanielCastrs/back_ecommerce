import { Mutation, Resolver, Args, Query, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../user/enums/user-role.enum';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Order)
  createOrder(
    @CurrentUser()
    user: {
      sub: string;
      email: string;
      role: string;
    },
  ) {
    return this.orderService.createOrder(user.sub);
  }
  @UseGuards(JwtAuthGuard)
  @Query(() => [Order])
  orders(
    @CurrentUser()
    user: {
      sub: string;
      email: string;
      role: string;
    },
  ) {
    return this.orderService.findMyOrders(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Order)
  order(
    @Args('id', { type: () => ID })
    id: string,

    @CurrentUser()
    user: {
      sub: string;
      email: string;
      role: string;
    },
  ) {
    return this.orderService.findMyOrder(user.sub, id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Query(() => [Order])
  allOrders() {
    return this.orderService.findAllOrders();
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Order)
  cancelOrder(
    @Args('id', { type: () => ID })
    id: string,

    @CurrentUser()
    user: {
      sub: string;
      email: string;
      role: string;
    },
  ) {
    return this.orderService.cancelOrder(user.sub, id);
  }
}
