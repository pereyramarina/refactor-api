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

/**
 * Interface para ciudad
 */
export interface ICity {
  id: string;
  city: string;
  value: number
}


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
  implements OnModuleInit, OnModuleDestroy {
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
    const newFrom = new Date(from.setHours(0, 0, 0, 0)); // Se cambio el nombre de la constante para que sea más descriptivo
    const newTo = new Date(to.setHours(23, 59, 59, 999)); // Se cambio el nombre de la constante para que sea más descriptivo

    const result = await this.claim.findMany({
      where: {
        active: true,
        deleted: false,
        createdAt: { gte: newFrom, lte: newTo },
        neighborhood: { city: { id: { in: cityIDs } } },
      },
      include: {
        neighborhood: { include: { city: true } },
      },
    });

    // Se cambio nombre de la variable para que sea más descriptivo
    const report: {
      id: string;
      cities: ICity[]; // Se implementa el uso de la interfaz ICity
    }[] = [];

    result.forEach((claim) => {
      // Se a cambiado de la variable para que sea más descriptivo
      // Se a cambiado de la variable dentro del metodo findIndex para que sea más descriptivo
      let index_neighborhood = report.findIndex((item) => item.id == claim.neighborhood.id);
      if (index_neighborhood < 0) {
        let item = {
          id: claim.neighborhood.id,
          cities: [],
        };
        report.push(item);
        index_neighborhood = report.length - 1;
      }

      // Se a cambiado el nombre de la variable para que sea más descriptivo
      // Se a cambiado el nombre de la variable dentro del metodo findIndex para que sea más descriptivo y uso la interfaz ICity
      let index_city = report[index_neighborhood].cities.findIndex((city: ICity) => city.id == claim.neighborhood.city.id);

      if (index_city < 0) {
        // J: Cambié el nombre de la variable para que sea más descriptivo y uso la interfaz ICity
        const newCity: ICity = {
          id: claim.neighborhood.city.id,
          city: claim.neighborhood.city.name,
          value: 0,
        };

        report[index_neighborhood].cities.push(newCity);
        index_city = report[index_neighborhood].cities.length - 1;
      }
      report[index_neighborhood].cities[index_city].value += 1;
    });

    return report;
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
  async findAll(@Query() param: ClaimPaginatorDto) {
    let where: Prisma.ClaimWhereInput = { deleted: false };
    let skip;
    let take;
    let orderBy;
    let metadata;

    if (param.id) where = { ...where, id: param.id };
    if (param.id_visible) where = { ...where, id_visible: param.id_visible };
    if (param.claimType)
      where = {
        ...where,
      };
    if (param.neighborhood)
      where = {
        ...where,
        neighborhood: {
          name: {
            contains: param.neighborhood,
            mode: 'insensitive',
          },
        },
      };

    if (param.clientName)
      where = {
        ...where,
        clientName: {
          contains: param.clientName,
          mode: 'insensitive',
        },
      };
    if (param.client_lastName)
      where = {
        ...where,
        clientLastName: {
          contains: param.client_lastName,
          mode: 'insensitive',
        },
      };

    if (param.phone)
      where = {
        ...where,
        phone: {
          contains: param.phone,
          mode: 'insensitive',
        },
      };
    if (param.clientCount)
      where = {
        ...where,
        clientCount: {
          contains: param.clientCount,
          mode: 'insensitive',
        },
      };
    where = {
      ...where,
      direction: {
        contains: param.direction,
        mode: 'insensitive',
      },
    };

    if (param.createdAt) {
      const from = new Date(param.createdAt.setHours(0, 0, 0, 0));
      const to = new Date(param.createdAt.setHours(23, 59, 59, 999));
      where = {
        ...where,
        createdAt: {
          gte: from,
          lte: to,
        },
      };
    }

    if (param.active != undefined) where = { ...where, active: param.active };

    if (param.cityIDs)
      where = {
        ...where,
        neighborhood: {
          name: param.neighborhood
            ? {
              contains: param.neighborhood,
              mode: 'insensitive',
            }
            : undefined,
          city: {
            OR: [
              {
                name: {
                  contains: param.cityIDs[0],
                  mode: 'insensitive',
                },
              },
              { id: { in: param.cityIDs } },
            ],
          },
        },
      };

    // Hacemos un count de los registros ´´con filtro´´
    const totalRecords = await this.claim.count({ where });
    // Calculamos la última página
    const lastPage = Math.ceil(totalRecords / param.perPage);
    if (param.page && param.perPage) {
      skip = (param.page - 1) * param.perPage;
      take = param.perPage;
    }

    if (param.sortBy)
      orderBy = {
        [param.sortByProperty ? param.sortByProperty : 'id_visible']: param.sortBy,
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
    if (param.page && param.perPage) {
      // Si hay un paginator activo
      metadata = {
        page: param.page,
        totalRecords,
        lastPage,
      };
    } else {
      //O se trajeron los datos completos
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