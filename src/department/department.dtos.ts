import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';

export class CreateDeptDto {
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly profileImg: string;

  @IsString()
  readonly contact: string;

  @IsEmail()
  readonly email: string;
}
export class UpdateDeptDto {
  @IsOptional()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly profileImg: string;

  @IsOptional()
  @IsString()
  readonly contact: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  readonly emergencyContact: string;

  @IsOptional()
  @IsArray()
  readonly EID: any;
}
export class UpdateDeptRequestDto {
  data: { UpdateDeptDto; EID: any };
}
export class IdQuery {
  @IsString()
  readonly contact: string;
}
export class IdQueryRequestDto {
  id: IdQuery;
}
