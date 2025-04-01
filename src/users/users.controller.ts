import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { CreateUserDto } from './create-user.dto';
import { UserPaginator } from './user.paginator.dto';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  onModuleInit() {
    this.$connect();
  }

  onModuleDestroy() {
    this.$disconnect();
  }

  @Get()
  async findAll(@Query() param: UserPaginator) {
    let where: Prisma.UserWhereInput = { deleted: false };

    let skip;
    let take;
    let orderBy: Prisma.UserOrderByWithRelationInput;
    let metadata;

    // Definimos los parámetros de filtro --------------------------->
    if (param.name) {
      where = {
        ...where,
        OR: [
          { name: { contains: param.name, mode: 'insensitive' } },
          { last_name: { contains: param.name, mode: 'insensitive' } },
        ],
      };
    }
    if (param.id) {
      where = { ...where, id_visible: param.id };
    }
    if (param.mail) where = { ...where, mail: { contains: param.mail } };
    if (param.username) where = { ...where, username: { contains: param.username } };
    if (param.active !== undefined) where = { ...where, active: param.active };
    if (param.root) where = { ...where, root: param.root };
    // Definimos los parámetros de filtro --------------------------->
    // Hacemos un count de los registros (con filtro)
    const totalRecords = await this.user.count({ where });
    // Calculamos la última página
    const lastPage = Math.ceil(totalRecords / param.perPage);
    // En caso de usar el paginator
    if (param.page && param.perPage) {
      skip = (param.page - 1) * param.perPage;
      take = param.perPage;
    }
    // Y si se hace el ordenar por
    if (param.sortBy)
      orderBy = { [param.sortByProperty ? param.sortByProperty : 'id']: param.sortBy };
    // Traemos los datos
    const data = await this.user.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        userCity: {
          where: { city: { active: true, deleted: false } },
          include: { city: true },
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
    // Envío la contraseña,  se encuentra encriptada
    return this.user.findFirst({
      where: { id },
      include: {
        userCity: {
          where: { city: { active: true, deleted: false } },
          include: { city: true },
        },
      },
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<CreateUserDto>,
  ) {
    const user = await this.user.findFirst({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');

    // Para cambiar la contraseña, se tiene que enviar la propiedad ´´old_password´´, con la contraseña vieja
    if (updateUserDto.old_password) {
      // Verificamos que la contraseña vieja sea correcta
      const samePassword = bcrypt.compareSync(
        updateUserDto.old_password,
        user.password,
      );

      if (!samePassword) throw new UnauthorizedException('Wrong password');

      // Hasheamos (Convierte los datos en un formato ilegible usando una clave de encriptación) las contraseña nueva
      const hashPassword = bcrypt.hashSync(updateUserDto.password, 12);
      // Creamos el objeto parcial para guardar los registros que se modifican
      //Mandamos todo
      const result = await this.user
        .update({
          where: { id },
          data: {
            password: hashPassword,
            otp: updateUserDto.otp,
          },
        })
        .catch((err) => {
          throw new BadRequestException(err);
        });
      const { password: _, ...updateUser } = result;
      return updateUser;
    } else {
      const { deletedCityID = [], updateCityID = [], ...rest } = updateUserDto;

      const result = await this.user
        .update({
          where: { id },
          data: {
            ...rest,
            userCity: {
              create:
                updateCityID.length > 0
                  ? updateCityID.map((c) => {
                    return { cityID: c };
                  })
                  : undefined,
              deleteMany:
                deletedCityID.length > 0
                  ? deletedCityID.map((c) => {
                    return { cityID: c };
                  })
                  : undefined,
            },
          },
          include: {
            userCity: {
              where: { city: { active: true, deleted: false } },
              include: { city: true },
            },
          },
        })
        .catch((err) => {
          console.error(err);
          throw new BadRequestException(err);
        });
      const { password: _, ...user } = result;
      return user;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.findOne(id); //! Buscamos el error
    const user = await this.update(id, {
      deleted: true,
      deleteDate: new Date(),
    });
    if (!user) throw new BadRequestException('Something goes wrong');
    return `User removed`;
  }
}