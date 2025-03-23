import { Module } from '@nestjs/common';
import { ClaimController } from './claim.controller';

@Module({
  controllers: [ClaimController],
})
export class ClaimModule {}
