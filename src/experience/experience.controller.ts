import {
  Controller,
  Get,
  Put,
  Req,
  Res,
  Body,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeService } from '../employee/employee.service';
import { ExperienceService } from './exprience.service';
import {
  AddExpReqDto,
  SkillReqDto,
  PrevJobReqDto,
  TrainingReqDto,
  SIdQueryRequestDto,
  EIdQueryRequestDto,
  PJIdQueryRequestDto,
  TIdQueryRequestDto,
} from './experience.dtos';
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
    private readonly experienceService: ExperienceService,
  ) {}
  @Get()
  async allExperiences(@Req() req: Request, @Res() res: Response) {
    try {
      const myExperiences = await this.Experience.find({});
      res.status(200).json(myExperiences);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/me')
  @UseGuards(JwtAuthGuard)
  async myExperience(@Req() req: any, @Res() res: Response) {
    try {
      const myExmployee = await this.employeeService.findUserByReq(req);
      const mine = await this.experienceService.giveMyExperience(
        myExmployee.EXID,
      );
      res.status(200).json(mine);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('add')
  @UseGuards(JwtAuthGuard)
  async addExperience(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: AddExpReqDto,
    @Query() query: EIdQueryRequestDto,
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
      res.status(500).json('Invalid Error');
    }
  }
  @Put('update')
  @UseGuards(JwtAuthGuard)
  async updateExperience(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: AddExpReqDto,
    @Query() query: any,
  ) {
    const { eid, exid } = query;
    const { skills, prevJobs, trainings } = body;
    try {
      if (!eid || !exid) {
        res.status(404);
        throw new Error('Insufficient data');
      }
      const mineEmp = await this.employeeService.giveMyEmployee(eid);
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
      const myExperience = await this.Experience.findById(exid);
      for (const skill of skills) {
        const addSkill = await this.Skills.create(skill);
        await addSkill.save();
        myExperience.SKID.push(addSkill);
      }
      for (const training of trainings) {
        const addTraining = await this.Trainings.create(training);
        await addTraining.save();
        myExperience.TRID.push(addTraining);
      }
      for (const prevJob of prevJobs) {
        const addPrevJob = await this.PrevJobs.create(prevJob);
        await addPrevJob.save();
        myExperience.PJID.push(addPrevJob);
      }
      await myExperience.save();

      const wholeData = await mineEmp.populate({
        path: 'EXID',
        populate: {
          path: 'PJID TRID SKID',
        },
      });
      res.status(201).json(wholeData);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('edit/skill')
  @UseGuards(JwtAuthGuard)
  async editSkills(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: SkillReqDto,
    @Query() query: SIdQueryRequestDto,
  ) {
    const { sid } = query;
    const { skill } = body;
    if (!sid || !skill) {
      res.status(400);
      throw new Error('insufficient details');
    }
    try {
      const obayedRules = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('employee'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const editedSkills = await this.Skills.findByIdAndUpdate(sid, skill, {
        new: true,
      });
      if (!editedSkills) {
        res.status(400);
        throw new Error('Invalid Error');
      }
      res.status(201).json(editedSkills);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('edit/prevjob')
  @UseGuards(JwtAuthGuard)
  async editPrevJobs(
    @Req() req: any,
    @Res() res: Response,
    @Query() query: PJIdQueryRequestDto,
    @Body() body: PrevJobReqDto,
  ) {
    const { pjid } = query;
    const { prevJob } = body;
    if (!pjid || !prevJob) {
      res.status(400);
      throw new Error('insufficient details');
    }
    try {
      const obayedRules = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('employee'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const editedPrevJobs = await this.PrevJobs.findByIdAndUpdate(
        pjid,
        prevJob,
        {
          new: true,
        },
      );
      if (!editedPrevJobs) {
        res.status(400);
        throw new Error('Invalid Error');
      }
      res.status(201).json(editedPrevJobs);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('edit/training')
  @UseGuards(JwtAuthGuard)
  async editTrainings(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: TrainingReqDto,
    @Query() query: TIdQueryRequestDto,
  ) {
    const { tid } = query;
    const { training } = body;
    if (!tid || !training) {
      res.status(400);
      throw new Error('insufficient details');
    }
    try {
      const obayedRules = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('employee'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const editedTraining = await this.Trainings.findByIdAndUpdate(
        tid,
        training,
        {
          new: true,
        },
      );
      if (!editedTraining) {
        res.status(400);
        throw new Error('Invalid Error');
      }
      res.status(201).json(editedTraining);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('remove/skill')
  @UseGuards(JwtAuthGuard)
  async removeSkill(
    @Req() req: any,
    @Res() res: Response,
    @Query() query: any,
  ) {
    const { exid, skid } = query;
    try {
      if (!exid || !skid) {
        res.status(404);
        throw new Error('Insufficient data');
      }
      const remSkill = await this.Skills.findOneAndDelete(skid);
      if (remSkill) {
        await this.Experience.findByIdAndUpdate(
          exid,
          {
            $pull: { SKID: skid },
          },
          {
            new: true,
          },
        );
      }
      res.status(201).json(remSkill);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('remove/prevjob')
  @UseGuards(JwtAuthGuard)
  async removePrevJob(
    @Req() req: any,
    @Res() res: Response,
    @Query() query: any,
  ) {
    const { exid, pjid } = query;
    try {
      if (!exid || !pjid) {
        res.status(404);
        throw new Error('Insufficient data');
      }
      const removePrevJob = await this.PrevJobs.findOneAndDelete(pjid);
      if (removePrevJob) {
        await this.Experience.findByIdAndUpdate(
          exid,
          {
            $pull: { PJID: pjid },
          },
          {
            new: true,
          },
        );
      }
      res.status(201).json(removePrevJob);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('remove/training')
  @UseGuards(JwtAuthGuard)
  async removeTraining(
    @Req() req: any,
    @Res() res: Response,
    @Query() query: any,
  ) {
    const { exid, tid } = query;
    try {
      if (!exid || !tid) {
        res.status(404);
        throw new Error('Insufficient data');
      }
      const removeTraining = await this.Trainings.findOneAndDelete(tid);
      if (removeTraining) {
        await this.Experience.findByIdAndUpdate(
          exid,
          {
            $pull: { TRID: tid },
          },
          {
            new: true,
          },
        );
      }
      res.status(201).json(removeTraining);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  async deleteExperience(
    @Req() req: any,
    @Res() res: Response,
    @Query() query: any,
  ) {
    const { eid, exid } = query;
    try {
      if (!exid) {
        res.status(404);
        throw new Error('Insufficient details');
      }
      const myEmp = await this.employeeService.giveMyEmployee(eid);
      if (myEmp && exid) {
        const myExperience =
          await this.experienceService.giveMyExperience(exid);
        if (myExperience) {
          if (myExperience?.PJID.length > 0) {
            for (const pjid of myExperience.PJID) {
              await this.experienceService.delMyPrevJob(pjid);
            }
          }
          if (myExperience?.TRID.length > 0) {
            for (const tid of myExperience.TRID) {
              await this.experienceService.delMyTraining(tid);
            }
          }
          if (myExperience?.SKID.length > 0) {
            for (const skid of myExperience.SKID) {
              await this.experienceService.delMySkill(skid);
            }
          }
          await this.experienceService.delMyExperience(exid);
        }
        myEmp.EXID = null;
        await myEmp.save();
      }
      res.status(201).json({ myEmp });
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
}
