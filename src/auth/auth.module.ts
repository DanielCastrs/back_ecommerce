import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserModule } from 'src/user/user.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    UserModule,

    JwtModule.register({
      global: true,
      secret: 'ecommerce-secret',
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],

  providers: [AuthService, AuthResolver, JwtAuthGuard],

  exports: [JwtAuthGuard],
})
export class AuthModule {}
