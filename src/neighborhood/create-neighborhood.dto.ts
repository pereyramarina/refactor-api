import { IsOptional } from 'class-validator';

export class CreateNeighborhoodDto {
  @IsOptional()
  id_visible: number;
  @IsOptional()
  uploadUserID: string;
  @IsOptional()
  name: string;
  @IsOptional()
  zoneID: string;
  @IsOptional()
  cityID: string;
  @IsOptional()
  coordinates: string[];
  @IsOptional()
  updatedAt: Date;
  @IsOptional()
  deletedAt: Date;
  @IsOptional()
  deleted: boolean;
  @IsOptional()
  active: boolean;
}
