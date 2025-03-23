import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class JWTPassport
  extends PassportStrategy(Strategy)
  implements OnModuleInit, OnModuleDestroy
{
  private prisma = new PrismaClient(); // Instancia de Prisma

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SEED_DE_JWT',
    });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  /**
   * No olvidarse que el payload es:
   *   sub: string; ==> ES EL ID!!
   *   username: string;
   *   otp: boolean;
   */
  async validate(payload: any) {
    try {
      return await this.prisma.user.findFirst({
        where: { id: payload.sub },
        include: {
          userCity: {
            where: { city: { active: true, deleted: false } },
            include: { city: true },
          },
        },
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid information');
    }
  }
}
