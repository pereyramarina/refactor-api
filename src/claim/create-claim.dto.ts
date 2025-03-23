import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class CreateClaimDto {
  @IsOptional()
  id_visible: number;
  @IsOptional()
  uploadUserID: string;
  @IsOptional()
  direction: string;
  @IsOptional()
  clientLastName: string;
  @IsOptional()
  clientName: string;
  @IsOptional()
  clientCount: string;
  @IsOptional()
  phone: string;
  @IsOptional()
  description: string;
  @IsOptional()
  claimTypeID: string;
  @IsOptional()
  neighborhoodID: string;
  @IsOptional()
  workerID: string;
  @IsOptional()
  tasks: string;
  @IsOptional()
  newWorkWith: any;
  @IsOptional()
  id: string;
  @IsOptional()
  closeAt: Date;
  @IsOptional()
  updatedAt: Date;
  @IsOptional()
  @Type(() => Date)
  deletedAt: Date;
  @IsOptional()
  deleted: boolean;
  @IsOptional()
  active: boolean;
  @IsOptional()
  createdAt: Date;
}
