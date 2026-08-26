import {
  Field,
  Float,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
});

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
});

@ObjectType()
export class Payment {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  orderId: string;

  @Field(() => Float)
  amount: number;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field(() => PaymentMethod)
  method: PaymentMethod;

  @Field()
  createdAt: Date;
}
