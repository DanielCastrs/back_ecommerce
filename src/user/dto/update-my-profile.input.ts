import { Field, InputType, PartialType } from '@nestjs/graphql';

import { CreateUserInput } from './create-user.input';

@InputType()
export class UpdateMyProfileInput extends PartialType(CreateUserInput) {}
