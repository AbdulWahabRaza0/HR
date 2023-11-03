// employee.dto.ts
import {
  IsString,
  IsEmail,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class EmployeeDTO {
  @IsOptional()
  @IsNumber()
  moduleNumber: number = 1;

  @IsString()
  name: string = '';

  @IsString()
  fatherName: string;

  @IsString()
  cnic: string = '';

  @IsString()
  profileImg: string =
    'https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg?size=338&ext=jpg&ga=GA1.1.1826414947.1698883200&semt=ais';

  @IsString()
  contact: string;

  @IsString()
  @IsOptional()
  emergencyContact: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsNumber()
  @IsEnum([0, 1, 2, 3])
  role: number = 0;

  @IsNumber()
  @IsEnum([0, 1])
  status: number = 0;

  @IsOptional()
  moduleAccess: number[];
}
