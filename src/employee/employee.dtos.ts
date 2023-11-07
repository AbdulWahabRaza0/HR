import { IsString, IsEmail, IsOptional, IsInt, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly fatherName: string;

  @IsString()
  readonly cnic: string;

  @IsOptional()
  @IsString()
  readonly profileImg: string;

  @IsString()
  readonly contact: string;

  @IsString()
  readonly emergencyContact: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;

  @IsOptional()
  @IsInt()
  readonly role: number;

  @IsOptional()
  @IsArray()
  readonly moduleAccess: string[];
}
export class AuthUserDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;
}
