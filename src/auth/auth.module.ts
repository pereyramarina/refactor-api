import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JWTPassport } from './passport/jwt.passport';

@Module({
  imports: [
    JwtModule.register({
      secret: 'SEED_DE_JWT',
    }),
  ],
  controllers: [AuthController],
  providers: [JWTPassport],
})
export class AuthModule {}
