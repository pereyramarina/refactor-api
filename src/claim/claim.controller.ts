import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  OnModuleDestroy,
  OnModuleInit,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Prisma, PrismaClient } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ClaimPaginatorDto } from './claim-paginator.dto';
import { CreateClaimDto } from './create-claim.dto';
import { Owner } from '@/common/decorators/user.decorator';

export interface Data {
  value: number;
  data: {
    id: string;
    name: string;
    value: number;
    types: { id: string; name: string; value: number }[];
  }[];
}

@Controller('claim')
export class ClaimController
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  onModuleInit() {
    this.$connect();
  }

  onModuleDestroy() {
    this.$disconnect();
  }

  //# Estadísticas -------------------------------------->
  @Get('claim-location')
  async getReportByCity(@Query() paginator: ClaimPaginatorDto) {
    const { from, to, cityIDs } = paginator;
    const f = new Date(from.setHours(0, 0, 0, 0));
    const t = new Date(to.setHours(23, 59, 59, 999));

    const result = await this.claim.findMany({
      where: {
        active: true,
        deleted: false,
        createdAt: { gte: f, lte: t },
        neighborhood: { city: { id: { in: cityIDs } } },
      },
      include: {
        neighborhood: { include: { city: true } },
      },
    });

    const a: {
      id: string;
      cities: { id: string; city: string; value: number }[];
    }[] = [];

    result.forEach((claim) => {
      let n = a.findIndex((i) => i.id == claim.neighborhood.id);
      if (n < 0) {
        let item = {
          id: claim.neighborhood.id,
          cities: [],
        };
        a.push(item);
        n = a.length - 1;
      }
      let c = a[n].cities.findIndex((i) => i.id == claim.neighborhood.city.id);
      if (c < 0) {
        const item = {
          id: claim.neighborhood.city.id,
          city: claim.neighborhood.city.name,
          value: 0,
        };
        a[n].cities.push(item);
        c = a[n].cities.length - 1;
      }
      a[n].cities[c].value += 1;
    });

    return a;
  }
  //# Estadísticas -------------------------------------->

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async create(@Body() data: any, @Owner() usuario: any) {
    try {
      if (!data.form || typeof data.form !== 'string') {
        throw new BadRequestException('Missing or invalid "form" field.');
      }

      const parsedData = JSON.parse(data.form);

      const body = plainToInstance(CreateClaimDto, parsedData);

      const errors = await validate(body);

      if (errors.length > 0) {
        throw new BadRequestException(
          `Validation failed: ${errors
            .map((error) => Object.values(error.constraints || {}).join(', '))
            .join('; ')}`,
        );
      }

      return this.claim.create({
        data: {
          ...body,
          id_visible: (await this.claim.count()) + 1,
          uploadUserID: usuario ? usuario.id : undefined,
        },
        include: { uploadUser: true },
      });
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('Data is not valid JSON.');
      }
      throw error; // Propagar otros errores no relacionados
    }
  }

  @Get()
  async findAll(@Query() p: ClaimPaginatorDto) {
    let where: Prisma.ClaimWhereInput = { deleted: false };
    let skip;
    let take;
    let orderBy;
    let metadata;

    if (p.id) where = { ...where, id: p.id };
    if (p.id_visible) where = { ...where, id_visible: p.id_visible };
    if (p.claimType)
      where = {
        ...where,
      };
    if (p.neighborhood)
      where = {
        ...where,
        neighborhood: {
          name: {
            contains: p.neighborhood,
            mode: 'insensitive',
          },
        },
      };

    if (p.clientName)
      where = {
        ...where,
        clientName: {
          contains: p.clientName,
          mode: 'insensitive',
        },
      };
    if (p.client_lastName)
      where = {
        ...where,
        clientLastName: {
          contains: p.client_lastName,
          mode: 'insensitive',
        },
      };

    if (p.phone)
      where = {
        ...where,
        phone: {
          contains: p.phone,
          mode: 'insensitive',
        },
      };
    if (p.clientCount)
      where = {
        ...where,
        clientCount: {
          contains: p.clientCount,
          mode: 'insensitive',
        },
      };
    where = {
      ...where,
      direction: {
        contains: p.direction,
        mode: 'insensitive',
      },
    };

    if (p.createdAt) {
      const from = new Date(p.createdAt.setHours(0, 0, 0, 0));
      const to = new Date(p.createdAt.setHours(23, 59, 59, 999));
      where = {
        ...where,
        createdAt: {
          gte: from,
          lte: to,
        },
      };
    }

    if (p.active != undefined) where = { ...where, active: p.active };

    if (p.cityIDs)
      where = {
        ...where,
        neighborhood: {
          name: p.neighborhood
            ? {
                contains: p.neighborhood,
                mode: 'insensitive',
              }
            : undefined,
          city: {
            OR: [
              {
                name: {
                  contains: p.cityIDs[0],
                  mode: 'insensitive',
                },
              },
              { id: { in: p.cityIDs } },
            ],
          },
        },
      };

    // Hacemos un count de los registros (con filtro)
    const totalRecords = await this.claim.count({ where });
    // Calculamos la última página
    const lastPage = Math.ceil(totalRecords / p.perPage);
    if (p.page && p.perPage) {
      skip = (p.page - 1) * p.perPage;
      take = p.perPage;
    }

    if (p.sortBy)
      orderBy = {
        [p.sortByProperty ? p.sortByProperty : 'id_visible']: p.sortBy,
      };
    const data = await this.claim.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        neighborhood: true,
        uploadUser: {
          select: { name: true, last_name: true, id: true, username: true },
        },
      },
    });

    // Definimos los metadatos extras
    if (p.page && p.perPage) {
      //! Si hay un paginator activo
      metadata = {
        page: p.page,
        totalRecords,
        lastPage,
      };
    } else {
      //! O se trajeron los datos completos
      metadata = {
        totalRecords,
      };
    }
    // Retornamos la data
    return { data, metadata };
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.claim.findFirst({
      where: { id },
      include: {
        neighborhood: true,
        uploadUser: {
          select: { name: true, last_name: true, id: true, username: true },
        },
      },
    });
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) {
    try {
      if (!data.form || typeof data.form !== 'string') {
        throw new BadRequestException('Missing or invalid "form" field.');
      }

      const parsedData = JSON.parse(data.form);

      const body = plainToInstance(CreateClaimDto, parsedData);

      const errors = await validate(body);

      if (errors.length > 0) {
        throw new BadRequestException(
          `Validation failed: ${errors
            .map((error) => Object.values(error.constraints || {}).join(', '))
            .join('; ')}`,
        );
      }

      return this.claim.update({
        data: {
          ...body,
        },
        where: { id },
        include: {
          neighborhood: true,
          uploadUser: {
            select: { name: true, last_name: true, id: true, username: true },
          },
        },
      });
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('Data is not valid JSON.');
      }
      throw error; // Propagar otros errores no relacionados
    }
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.update(id, { deleted: true, deletedAt: new Date() });
  }
}
