import { SetMetadata } from '@nestjs/common';

export const PublicRoute = () => SetMetadata('CLAVE_PUBLICA', true);
