import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payment.service';
import { CreatePaymentInput } from './dto/create-payment.input';

@Resolver(() => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Payment)
  payOrder(
    @Args('input')
    input: CreatePaymentInput,

    @CurrentUser()
    user: {
      sub: string;
      email: string;
      role: string;
    },
  ) {
    return this.paymentService.payOrder(user.sub, input.orderId, input.method);
  }
}
