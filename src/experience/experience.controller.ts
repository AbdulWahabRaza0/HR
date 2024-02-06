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
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.gaurd';
import { modules } from '../utils/utils';
import { EIdQueryReqDto } from 'src/designation/designation.dtos';
@Controller('employee/experience')
@ApiTags('Experience')
@ApiBearerAuth('JWT')
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
  @ApiOperation({
    summary: 'Get all experiences',
    description: 'Retrieve all experiences.',
  })
  @ApiOkResponse({
    status: 200,
    description: 'Successfully retrieved experiences.',
  })
  @ApiBadRequestResponse({
    status: 500,
    description: 'Invalid Error',
  })
  async allExperiences(@Req() req: Request, @Res() res: Response) {
    try {
      const myExperiences = await this.Experience.find({})
        .populate('SKID')
        .populate('PJID')
        .populate('TRID');
      res.status(200).json(myExperiences);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get my experience',
    description: 'Retrieve the experience of the currently authenticated user.',
  })
  @ApiOkResponse({
    status: 200,
    description: 'Successfully retrieved my experience.',
  })
  @ApiBadRequestResponse({ status: 500, description: 'Internal Server Error.' })
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
  @Put('/specific')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user experience',
    description:
      'Retrieve the experience of the requested user if you are admin.',
  })
  @ApiQuery({
    name: 'id',
    type: 'string',
    description: 'The employee ID as a query parameter',
    required: true,
  })
  @ApiOkResponse({
    status: 200,
    description: 'Successfully retrieved user experience.',
  })
  @ApiBadRequestResponse({ status: 500, description: 'Internal Server Error.' })
  async specificExperience(
    @Req() req: any,
    @Res() res: Response,
    @Query() query: EIdQueryRequestDto,
  ) {
    const { id } = query;
    try {
      if (!id) {
        res.status(404);
        throw new Error('Insufficient data');
      }

      const obayedRules = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('employee'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const myEmp = await this.employeeService.giveMyEmployee(id);
      if (!myEmp.EXID) {
        res.status(401);
        throw new Error('Employee experience not found');
      }
      const mine = await this.experienceService.giveMyExperience(myEmp.EXID);
      res.status(200).json(mine);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('add')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Add experience for the authenticated user',
    description:
      'Add a new experience including skills, previous jobs, and trainings for the authenticated user.',
  })
  @ApiResponse({ status: 201, description: 'Successfully added experience.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'Insufficient data or My employee not found.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        skills: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              skillName: { type: 'string' },
              duration: { type: 'string' },
            },
          },
          description: 'Array of skills',
        },
        prevJobs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              jobTitle: { type: 'string' },
              companyName: { type: 'string' },
              companyContact: { type: 'string' },
              salary: { type: 'number' },
            },
          },
          description: 'Array of previous jobs',
        },
        trainings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              trainingName: { type: 'string' },
              instituteName: { type: 'string' },
              description: { type: 'string' },
              tariningDuration: { type: 'string' },
              outcomeDetails: { type: 'string' },
            },
          },
          description: 'Array of trainings',
        },
      },
    },
  })
  @ApiQuery({
    name: 'id',
    type: 'string',
    description: 'The employee ID as a query parameter',
    required: true,
  })
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
      // console.log('This is pre jobs ', skills, ' ', prevJobs, ' ', trainings);

      const newExperience = new this.Experience();
      for (const skill of skills) {
        const addSkill = await this.Skills.create(skill);
        await addSkill.save();
        newExperience?.SKID?.push(addSkill._id);
      }
      for (const prevJob of prevJobs) {
        const addPrevJob = await this.PrevJobs.create(prevJob);
        await addPrevJob.save();
        newExperience?.PJID?.push(addPrevJob._id);
      }
      for (const training of trainings) {
        const addTraining = await this.Trainings.create(training);
        await addTraining.save();
        newExperience?.TRID?.push(addTraining._id);
      }

      await newExperience.save();
      // console.log(
      //   'This is my new experience id ',
      //   newExperience,
      //   ' and eid is ',
      //   mineEmp,
      // );
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
  @ApiOperation({
    summary: 'Update experience for the authenticated user',
    description:
      'Update the existing experience, including skills, previous jobs, and trainings for the authenticated user.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        skills: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              skillName: { type: 'string' },
              duration: { type: 'string' },
            },
          },
          description: 'Array of skills',
        },
        prevJobs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              jobTitle: { type: 'string' },
              companyName: { type: 'string' },
              companyContact: { type: 'string' },
              salary: { type: 'number' },
            },
          },
          description: 'Array of previous jobs',
        },
        trainings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              trainingName: { type: 'string' },
              instituteName: { type: 'string' },
              description: { type: 'string' },
              tariningDuration: { type: 'string' },
              outcomeDetails: { type: 'string' },
            },
          },
          description: 'Array of trainings',
        },
      },
    },
  })
  @ApiQuery({
    name: 'eid',
    type: 'string',
    description: 'The employee ID',
  })
  @ApiQuery({
    name: 'exid',
    type: 'string',
    description: 'The experience ID to be updated',
  })
  @ApiResponse({ status: 201, description: 'Successfully updated experience.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'Insufficient data or My employee not found.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
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
  @Put('add/skill')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Add skills for the authenticated user',
    description: 'Add existing skills for the authenticated user.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        skill: {
          type: 'object',
          properties: {
            skillName: { type: 'string' },
            duration: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'eid',
    type: 'string',
    description: 'The Employee id ID to add skill in experience',
  })
  @ApiResponse({ status: 201, description: 'Successfully edited skills.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 400,
    description: 'Insufficient details or Invalid Error.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async addSkills(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: SkillReqDto,
    @Query() query: EIdQueryReqDto,
  ) {
    const { eid } = query;
    const { skill } = body;
    if (!eid || !skill) {
      res.status(400);
      throw new Error('insufficient details');
    }
    try {
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
      if (mineEmp?.EXID) {
        //only push the skill in the experience
        const addSkill = await this.Skills.create(skill);
        await addSkill.save();
        const newExperience = await this.Experience.findById(mineEmp.EXID);
        newExperience?.SKID?.push(addSkill._id);
        await newExperience.save();
        return res.status(201).json(mineEmp);
      }
      const newExperience = new this.Experience();
      const addSkill = await this.Skills.create(skill);
      await addSkill.save();
      newExperience.SKID.push(addSkill._id);
      await newExperience.save();
      // console.log('This is experience ', newExperience);

      mineEmp.EXID = newExperience._id;
      await mineEmp.save();
      return res.status(201).json(mineEmp);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('add/prevjob')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Add previous jobs for the authenticated user',
    description: 'Add existing previous jobs for the authenticated user.',
  })
  @ApiQuery({
    name: 'eid',
    type: 'string',
    description: 'The employee ID to add previous job',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prevJob: {
          type: 'object',
          properties: {
            jobTitle: { type: 'string' },
            companyName: { type: 'string' },
            companyContact: { type: 'string' },
            salary: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully edited previous jobs.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 400,
    description: 'Insufficient details or Invalid Error.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async addPrevJob(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: PrevJobReqDto,
    @Query() query: EIdQueryReqDto,
  ) {
    const { eid } = query;
    const { prevJob } = body;
    if (!eid || !prevJob) {
      res.status(400);
      throw new Error('insufficient details');
    }
    try {
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
      if (mineEmp.EXID) {
        const addPrevJob = await this.PrevJobs.create(prevJob);
        await addPrevJob.save();
        const newExperience = await this.Experience.findById(mineEmp.EXID);
        newExperience.PJID.push(addPrevJob._id);
        await newExperience.save();
        return res.status(201).json(mineEmp);
      }
      const newExperience = new this.Experience();
      const addPrevJob = await this.PrevJobs.create(prevJob);
      await addPrevJob.save();
      newExperience.PJID.push(addPrevJob._id);
      await newExperience.save();
      mineEmp.EXID = newExperience._id;
      await mineEmp.save();
      res.status(201).json(mineEmp);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }

  @Put('add/training')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Add training details for the authenticated user',
    description: 'Add new training details for the authenticated user.',
  })
  @ApiQuery({
    name: 'eid',
    type: 'string',
    description: 'The employee id to add the experience training',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        training: {
          type: 'object',
          properties: {
            trainingName: { type: 'string' },
            instituteName: { type: 'string' },
            description: { type: 'string' },
            trainingDuration: { type: 'string' },
            outcomeDetails: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully added training details.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 400,
    description: 'Insufficient details or Invalid Error.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async addTraining(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: TrainingReqDto,
    @Query() query: EIdQueryReqDto,
  ) {
    const { eid } = query;
    const { training } = body;
    if (!eid || !training) {
      res.status(400);
      throw new Error('insufficient details');
    }
    try {
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
      if (mineEmp.EXID) {
        //only push the skill in the experience
        const addTraining = await this.Trainings.create(training);
        await addTraining.save();
        const newExperience = await this.Experience.findById(mineEmp.EXID);
        await newExperience.TRID.push(addTraining._id);
        await newExperience.save();
        return res.status(201).json(mineEmp);
      }
      const newExperience = new this.Experience();
      const addTraining = await this.Trainings.create(training);
      await addTraining.save();
      newExperience.TRID.push(addTraining._id);
      await newExperience.save();
      mineEmp.EXID = newExperience._id;
      await mineEmp.save();
      res.status(201).json(mineEmp);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }

  @Put('edit/skill')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Edit skills for the authenticated user',
    description: 'Edit existing skills for the authenticated user.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        skill: {
          type: 'object',
          properties: {
            skillName: { type: 'string' },
            duration: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'sid',
    type: 'string',
    description: 'The skill ID to be edited',
  })
  @ApiResponse({ status: 201, description: 'Successfully edited skills.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 400,
    description: 'Insufficient details or Invalid Error.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
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
  @ApiOperation({
    summary: 'Edit previous jobs for the authenticated user',
    description: 'Edit existing previous jobs for the authenticated user.',
  })
  @ApiQuery({
    name: 'pjid',
    type: 'string',
    description: 'The previous job ID to be edited',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prevJob: {
          type: 'object',
          properties: {
            jobTitle: { type: 'string' },
            companyName: { type: 'string' },
            companyContact: { type: 'string' },
            salary: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully edited previous jobs.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 400,
    description: 'Insufficient details or Invalid Error.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
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
  @ApiOperation({
    summary: 'Edit training details for the authenticated user',
    description: 'Edit existing training details for the authenticated user.',
  })
  @ApiQuery({
    name: 'tid',
    type: 'string',
    description: 'The training ID to be edited',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        training: {
          type: 'object',
          properties: {
            trainingName: { type: 'string' },
            instituteName: { type: 'string' },
            description: { type: 'string' },
            trainingDuration: { type: 'string' },
            outcomeDetails: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully edited training details.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 400,
    description: 'Insufficient details or Invalid Error.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
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
  @ApiOperation({
    summary: 'Remove skill for the authenticated user',
    description:
      'Remove a skill for the authenticated user by providing experience ID and skill ID.',
  })
  @ApiQuery({
    name: 'exid',
    type: 'string',
    description: 'The experience ID for the authenticated user',
  })
  @ApiQuery({
    name: 'skid',
    type: 'string',
    description: 'The skill ID to be removed',
  })
  @ApiResponse({ status: 201, description: 'Successfully removed the skill.' })
  @ApiResponse({ status: 404, description: 'Insufficient data.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
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
      const obayedRules = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('employee'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
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
  @ApiOperation({
    summary: 'Remove previous job for the authenticated user',
    description:
      'Remove a previous job for the authenticated user by providing experience ID and previous job ID.',
  })
  @ApiQuery({
    name: 'exid',
    type: 'string',
    description: 'The experience ID for the authenticated user',
  })
  @ApiQuery({
    name: 'pjid',
    type: 'string',
    description: 'The previous job ID to be removed',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully removed the previous job.',
  })
  @ApiResponse({ status: 404, description: 'Insufficient data.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
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
      const obayedRules = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('employee'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
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
  @ApiOperation({
    summary: 'Remove training for the authenticated user',
    description:
      'Remove a training for the authenticated user by providing experience ID and training ID.',
  })
  @ApiQuery({
    name: 'exid',
    type: 'string',
    description: 'The experience ID for the authenticated user',
  })
  @ApiQuery({
    name: 'tid',
    type: 'string',
    description: 'The training ID to be removed',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully removed the training.',
  })
  @ApiResponse({ status: 404, description: 'Insufficient data.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
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
      const obayedRules = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('employee'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
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
  @ApiOperation({
    summary: 'Delete experience for the authenticated user',
    description:
      'Delete the experience, including skills, previous jobs, and trainings for the authenticated user.',
  })
  @ApiQuery({
    name: 'eid',
    type: 'string',
    description: 'The employee ID for the authenticated user',
  })
  @ApiQuery({
    name: 'exid',
    type: 'string',
    description: 'The experience ID to be deleted',
  })
  @ApiResponse({ status: 201, description: 'Successfully deleted experience.' })
  @ApiResponse({ status: 404, description: 'Insufficient details.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
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
      const obayedRules = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('employee'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
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
