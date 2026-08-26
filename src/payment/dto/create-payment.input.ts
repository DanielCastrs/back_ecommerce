import { Field, ID, InputType } from '@nestjs/graphql';
import { PaymentMethod } from '../enums/payment-method.enum';

@InputType()
export class CreatePaymentInput {
  @Field(() => ID)
  orderId: string;

  @Field(() => PaymentMethod)
  method: PaymentMethod;
}
