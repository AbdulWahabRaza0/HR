import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  IsArray,
  // IsNumber,
} from 'class-validator';

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
  readonly moduleAccess: [];
}
export class AuthUserDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;
}
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly fatherName: string;

  @IsOptional()
  @IsString()
  readonly cnic: string;

  @IsOptional()
  @IsString()
  readonly profileImg: string;

  @IsOptional()
  @IsString()
  readonly contact: string;

  @IsOptional()
  @IsString()
  readonly emergencyContact: string;
}
export class UpdateUserRequestDto {
  data: [UpdateUserDto];
}
export class IdQuery {
  @IsString()
  readonly contact: string;
}
export class IdQueryRequestDto {
  id: IdQuery;
}
export class StatusRequestDto {
  @IsArray()
  readonly moduleAccess: [];
}
