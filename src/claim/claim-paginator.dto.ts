import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class PaginatorDto {
  @IsOptional()
  page: number;
  @IsOptional()
  perPage: number;
  @IsOptional()
  sortBy: string;
  @IsOptional()
  sortByProperty: string;
  @IsOptional()
  cityID: string;
  @IsOptional()
  from: Date;
  @IsOptional()
  to: Date;
  @IsOptional()
  cityIDs: string[];
}

export class ClaimPaginatorDto extends PartialType(PaginatorDto) {
  @IsOptional()
  relations: boolean;
  @IsOptional()
  active: boolean;
  @IsOptional()
  id: string;
  @IsOptional()
  id_visible: number;
  @IsOptional()
  clientName: string;
  @IsOptional()
  client_lastName: string;
  @IsOptional()
  direction: string;
  @IsOptional()
  neighborhood: string;
  @IsOptional()
  phone: string;
  @IsOptional()
  clientCount: string;
  @IsOptional()
  workerName: string;
  @IsOptional()
  claimType: string;
  @IsOptional()
  createdAt: Date;
}
