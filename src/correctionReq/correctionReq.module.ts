import { Module, forwardRef } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CorrectionReqController } from './correctionReq.controller';
import { CorrectionReqService } from './correctionReq.service';
import CorrectionReq from 'src/models/correctionReq.schema';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CorrectionReq', schema: CorrectionReq },
    ]),
    forwardRef(() => EmployeeModule),
  ],
  controllers: [CorrectionReqController],
  providers: [CorrectionReqService],
  exports: [CorrectionReqService],
})
export class CorrectionReqModule {}
