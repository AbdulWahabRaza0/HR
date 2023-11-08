import { Module, forwardRef } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { DepartmentModule } from 'src/department/department.module';
import Employee from 'src/models/employee.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Employee', schema: Employee }]),
    forwardRef(() => DepartmentModule),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
