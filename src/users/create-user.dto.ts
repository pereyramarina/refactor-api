import { IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  id_visible: number;
  @IsOptional()
  username: string;
  @IsOptional()
  mail: string;
  @IsOptional()
  password: string;
  @IsOptional()
  name?: string;
  @IsOptional()
  last_name?: string;
  @IsOptional()
  id_user?: string;
  @IsOptional()
  updateCityID: string[];
  @IsOptional()
  id?: string;
  @IsOptional()
  deleted?: boolean = false;
  @IsOptional()
  active?: boolean = true;
  @IsOptional()
  otp?: boolean;
  @IsOptional()
  root?: boolean;
  @IsOptional()
  createdDate: Date;
  @IsOptional()
  deleteDate?: Date;
  @IsOptional()
  old_password: string;
  @IsOptional()
  deletedCityID: string[];
}
