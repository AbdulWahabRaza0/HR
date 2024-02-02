import { Module, forwardRef } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeModule } from 'src/employee/employee.module';
import { ExperienceController } from './experience.controller';
import { ExperienceService } from './exprience.service';
import Experience from 'src/models/experience.schema';
import PrevJobs from 'src/models/prevJobs.schema';
import Skills from 'src/models/skills.schema';
import Trainings from 'src/models/training.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Experience', schema: Experience }]),
    MongooseModule.forFeature([{ name: 'PrevJobs', schema: PrevJobs }]),
    MongooseModule.forFeature([{ name: 'Skills', schema: Skills }]),
    MongooseModule.forFeature([{ name: 'Trainings', schema: Trainings }]),
    forwardRef(() => EmployeeModule),
  ],
  controllers: [ExperienceController],
  providers: [ExperienceService],
  exports: [ExperienceService],
})
export class ExperienceModule {}
