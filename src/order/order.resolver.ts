import { Mutation, Resolver, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

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
}
