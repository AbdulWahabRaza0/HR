import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import TimeAndAttendance from 'src/models/timeAndAttendance.schema';
import LeaveReq from 'src/models/leaveReq.schema';
import { EmployeeModule } from 'src/employee/employee.module';
import { TANDAService } from './tAndA.service';
import { TANDAController } from './tAndA.controller';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'TimeAndAttendance', schema: TimeAndAttendance },
      { name: 'LeaveReq', schema: LeaveReq },
    ]),

    forwardRef(() => EmployeeModule),
  ],
  controllers: [TANDAController],
  providers: [TANDAService],
  exports: [TANDAService],
})
export class TANDAModule {}
