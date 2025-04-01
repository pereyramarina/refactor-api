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
import { UserPaginator } from '@/users/user.paginator.dto'; // Se importa el paginator de usuario

@Controller('city')
export class CityController
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  onModuleInit() {
    this.$connect();
  }

  onModuleDestroy() {
    this.$disconnect();
  }

  @Post()
  async create(@Body() data: CreateCityDto, @Owner() usuario: UserPaginator /* Se especifica el tipo  */) {
    return this.city.create({
      data: {
        id_visible: (await this.city.count()) + 1,
        ...data,
        uploadUserID: usuario.id.toString(), //  Convertido a string
      },
      include: {
        uploadUser: {
          select: { name: true, last_name: true, id: true, username: true },
        },
      },
    });
  }

  @Get()
  async findAll(@Query() /* // Damos un nombre descriptivo al parametro */ city: CityPaginatorDto) {
    let where: Prisma.CityWhereInput = { deleted: false };

    if (city.id) where = { ...where, id: city.id };
    if (city.active != undefined) where = { ...where, active: city.active };

    // Hacemos un count de los registros ´´con filtro´´
    // Se cambio el nombre de la constante para que sea más descriptivo
    const total_citys = await this.city.count({ where });

    // Calculamos la última página
    const last_pages = Math.ceil(total_citys / city.perPage);

    const data = await this.city.findMany({
      where,
      skip: city.page && city.perPage ? (city.page - 1) * city.perPage : undefined,
      take: city.page && city.perPage ? city.perPage : undefined,
      orderBy: city.sortBy
        ? {
          [city.sortByProperty ? city.sortByProperty : 'id_visible']: city.sortBy,
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
        city.page && city.perPage
          ? {
            page: city.page,
            totalRecords: total_citys,
            lastPage: last_pages,
          }
          : {
            totalRecords: total_citys,
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