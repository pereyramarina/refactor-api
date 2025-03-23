import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { CreateCityDto } from './create-city.dto';
import { CityPaginatorDto } from './city-paginator.dto';
import { Owner } from '@/common/decorators/user.decorator';
import { Prisma, PrismaClient } from '@prisma/client';

@Controller('city')
export class CityController
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  onModuleInit() {
    this.$connect();
  }

  onModuleDestroy() {
    this.$disconnect();
  }

  @Post()
  async create(@Body() data: CreateCityDto, @Owner() usuario: any) {
    return this.city.create({
      data: {
        id_visible: (await this.city.count()) + 1,
        ...data,
        uploadUserID: usuario.id,
      },
      include: {
        uploadUser: {
          select: { name: true, last_name: true, id: true, username: true },
        },
      },
    });
  }

  @Get()
  async findAll(@Query() p: CityPaginatorDto) {
    let where: Prisma.CityWhereInput = { deleted: false };

    if (p.id) where = { ...where, id: p.id };
    if (p.active != undefined) where = { ...where, active: p.active };

    // Hacemos un count de los registros (con filtro)
    const t = await this.city.count({ where });
    // Calculamos la última página
    const l = Math.ceil(t / p.perPage);

    const data = await this.city.findMany({
      where,
      skip: p.page && p.perPage ? (p.page - 1) * p.perPage : undefined,
      take: p.page && p.perPage ? p.perPage : undefined,
      orderBy: p.sortBy
        ? {
            [p.sortByProperty ? p.sortByProperty : 'id_visible']: p.sortBy,
          }
        : undefined,
      include: {
        uploadUser: {
          select: { name: true, last_name: true, id: true, username: true },
        },
      },
    });

    // Retornamos la data
    return {
      data,
      metadata:
        p.page && p.perPage
          ? {
              page: p.page,
              totalRecords: t,
              lastPage: l,
            }
          : {
              totalRecords: t,
            },
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.city.findFirst({
      where: { id },
      include: {
        uploadUser: {
          select: { name: true, last_name: true, id: true, username: true },
        },
      },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<CreateCityDto>) {
    return this.city.update({
      data: {
        ...data,
      },
      where: { id },
      include: {
        uploadUser: {
          select: { name: true, last_name: true, id: true, username: true },
        },
      },
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.update(id, { deleted: true, deletedAt: new Date() });
    return `This action removes a #${id} claim`;
  }
}
