import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DepartmentController } from './department.controller';
import Department from 'src/models/department.schema';
import { DepartmentService } from './department.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Department', schema: Department }]),
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
