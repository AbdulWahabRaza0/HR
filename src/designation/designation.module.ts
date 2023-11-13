import { Module, forwardRef } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DesignationController } from './designation.controller';
import { DesignationService } from './designation.service';
import Designation from '../models/department.schema';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Designation', schema: Designation }]),
    forwardRef(() => EmployeeModule),
  ],
  controllers: [DesignationController],
  providers: [DesignationService],
  exports: [DesignationService],
})
export class DesignationModule {}
