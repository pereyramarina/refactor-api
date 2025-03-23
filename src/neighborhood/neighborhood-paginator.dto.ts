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

export class NeighborhoodPaginatorDto extends PartialType(PaginatorDto) {
  @IsOptional()
  active: boolean;
  @IsOptional()
  name: string;
  @IsOptional()
  id: string;
  @IsOptional()
  cityID: string;
  @IsOptional()
  from: Date;
  @IsOptional()
  to: Date;
}
