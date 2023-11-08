import {
  Controller,
  Get,
  Put,
  //   Delete,
  Req,
  Res,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeService } from '../employee/employee.service';
import { JwtAuthGuard } from '../auth/jwt-auth.gaurd';
import { modules } from 'src/utils/utils';
@Controller('employee/experience')
export class ExperienceController {
  constructor(
    @InjectModel('Experience') private Experience: Model<any>,
    @InjectModel('Skills') private Skills: Model<any>,
    @InjectModel('PrevJobs') private PrevJobs: Model<any>,
    @InjectModel('Trainings') private Trainings: Model<any>,
    private readonly employeeService: EmployeeService,
  ) {}
  @Get()
  async allExperiences(@Req() req: Request, @Res() res: Response) {
    try {
      const myExperiences = await this.Experience.find({});
      res.status(200).json(myExperiences);
    } catch (e) {
      console.log(e);
      res.status(500);
      throw new Error(e);
    }
  }
  @Put('add')
  @UseGuards(JwtAuthGuard)
  async addExperience(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
  ) {
    const { id } = query;
    const { skills, prevJobs, trainings } = body;
    try {
      if (!id) {
        res.status(404);
        throw new Error('Insufficient data');
      }
      const mineEmp = await this.employeeService.giveMyEmployee(id);
      if (!mineEmp) {
        res.status(404);
        throw new Error('My employee not found');
      }
      const obayedRules = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('employee'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      if (mineEmp.EXID) {
        const wholeData = await mineEmp.populate({
          path: 'EXID',
          populate: {
            path: 'PJID TRID SKID',
          },
        });
        return res.status(201).json(wholeData);
      }
      const newExperience = new this.Experience();
      for (const skill of skills) {
        const addSkill = await this.Skills.create(skill);
        await addSkill.save();
        newExperience.SKID.push(addSkill);
      }
      for (const training of trainings) {
        const addTraining = await this.Trainings.create(training);
        await addTraining.save();
        newExperience.TRID.push(addTraining);
      }
      for (const prevJob of prevJobs) {
        const addPrevJob = await this.PrevJobs.create(prevJob);
        await addPrevJob.save();
        newExperience.PJID.push(addPrevJob);
      }
      await newExperience.save();

      mineEmp.EXID = newExperience._id;
      await mineEmp.save();
      const wholeData = await mineEmp.populate({
        path: 'EXID',
        populate: {
          path: 'PJID TRID SKID',
        },
      });
      res.status(201).json(wholeData);
    } catch (e) {
      console.log(e);
      res.status(500);
      throw new Error('Invalid Error');
    }
  }
}
