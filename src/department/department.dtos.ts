import { IsString, IsEmail, IsOptional } from 'class-validator';

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
