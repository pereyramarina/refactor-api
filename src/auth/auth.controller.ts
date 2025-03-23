import { PublicRoute } from '@/common/decorators/public.decorator';
import { Owner } from '@/common/decorators/user.decorator';
import { CreateUserDto } from '@/users/create-user.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
}

@Controller('auth')
export class AuthController
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('AUTH');

  async onModuleInit() {
    this.$connect();
    try {
      const root = await this.user.findFirst({
        where: { OR: [{ username: 'admin' }, { mail: 'admin@admin.com' }] },
      });
      if (!root) {
        const rootUser = {
          username: 'admin',
          mail: 'admin@admin.com',
          password: bcrypt.hashSync('contraseña#admin2024', 12),
          root: true,
        };
        await this.user.create({ data: rootUser });
        this.logger.log('ROOT USER CREATED');
      } else this.logger.log('ROOT USER ALREADY EXIST');
    } catch (err) {
      this.logger.error(JSON.stringify(err));
    }
  }

  onModuleDestroy() {
    this.$disconnect();
  }

  constructor(private readonly jwt: JwtService) {
    super();
  }

  @Post('check')
  checkToken(@Body('token') token: string) {
    try {
      const payload = this.jwt.verify(token);
      if (payload) return true;
      else return false;
    } catch (error) {
      return false;
    }
  }

  @Post('login')
  @PublicRoute()
  async login(@Body() credentials: LoginDto) {
    if (credentials.username && credentials.password) {
      const result = await this.user.findFirst({
        where: {
          OR: [
            { username: credentials.username },
            { mail: credentials.username },
          ],
        },
        include: {
          userCity: {
            where: { city: { active: true, deleted: false } },
            include: { city: true },
          },
        },
      });
      if (!result) throw new UnauthorizedException('User not found');
      const samePass = bcrypt.compareSync(
        credentials.password,
        result.password,
      );
      if (!samePass) throw new UnauthorizedException('Wrong credentials');
      const { id: sub, username, otp } = result || {};
      const payload = {
        sub,
        username,
        otp,
      };

      const token = this.jwt.sign(payload);
      const { password: _, ...user } = result;
      return { user, token };
    } else throw new UnauthorizedException('Missing credentials');
  }

  @Post('register')
  async register(@Body() u: CreateUserDto, @Owner() owner: any) {
    const user: Partial<CreateUserDto> = {
      id_user: owner.id,
      password: bcrypt.hashSync(u.password, 12),
      ...u,
    };

    const result = await this.user
      .create({
        data: {
          ...user,
          userCity: {
            create:
              u.updateCityID.length > 0
                ? u.updateCityID.map((c) => {
                    return { cityID: c };
                  })
                : undefined,
          },
        },
      })
      .catch((err) => {
        console.error(err);
        throw new BadRequestException(err);
      });
    const { password: _, ...newUser } = result;
    return newUser;
  }

  @Get('info')
  getUserInfo(@Owner() user: any) {
    return user;
  }
}
