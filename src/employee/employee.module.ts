import { Module, forwardRef } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { DepartmentModule } from 'src/department/department.module';
import { ExperienceModule } from 'src/experience/experience.module';
import { CorrectionReqModule } from 'src/correctionReq/correctionReq.module';
import { DesignationModule } from 'src/designation/designation.module';
import Employee from 'src/models/employee.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Employee', schema: Employee }]),
    forwardRef(() => DepartmentModule),
    forwardRef(() => ExperienceModule),
    forwardRef(() => CorrectionReqModule),
    forwardRef(() => DesignationModule),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
