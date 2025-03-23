import { Module } from '@nestjs/common';
import { NeighborhoodController } from './neighborhood.controller';

@Module({
  controllers: [NeighborhoodController],
})
export class NeighborhoodModule {}
