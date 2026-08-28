import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserDebugResolver } from './user-debug.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  providers: [UserResolver, UserService, UserDebugResolver],
  exports: [UserService],
})
export class UserModule {}
