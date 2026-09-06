import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';

@InputType()
export class CreatePaymentInput {
  @Field(() => ID)
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @Field(() => PaymentMethod)
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
