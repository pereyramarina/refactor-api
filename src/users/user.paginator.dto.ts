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

export class UserPaginator extends PartialType(PaginatorDto) {
  @IsOptional()
  id: number;
  @IsOptional()
  name: string;
  @IsOptional()
  username: string;
  @IsOptional()
  mail: string;
  @IsOptional()
  delete: boolean;
  @IsOptional()
  active: boolean;
  @IsOptional()
  root: boolean;
}
