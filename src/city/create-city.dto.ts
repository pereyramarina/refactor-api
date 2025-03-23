import { IsOptional } from 'class-validator';

export class CreateCityDto {
  @IsOptional()
  uploadUserID: string;
  @IsOptional()
  name: string;
  @IsOptional()
  id_visible: number;
  @IsOptional()
  id: string;
  @IsOptional()
  createdAt: Date;
  @IsOptional()
  updatedAt: Date;
  @IsOptional()
  deletedAt: Date;
  @IsOptional()
  deleted: boolean;
  @IsOptional()
  active: boolean;
}
