import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Req,
  Res,
  Body,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { EmployeeService } from './employee.service';
import { DepartmentService } from 'src/department/department.service';
import { ExperienceService } from 'src/experience/exprience.service';
import { CorrectionReqService } from 'src/correctionReq/correctionReq.service';
import { DesignationService } from 'src/designation/designation.service';
import {
  CreateUserDto,
  AuthUserDto,
  UpdateUserRequestDto,
  IdQueryRequestDto,
  ModuleAccessRequestDto,
  RoleRequestDto,
} from './employee.dtos';
import {
  ApiTags,
  ApiOperation,
  // ApiOkResponse,
  // ApiBadRequestResponse,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.gaurd';
import { Model } from 'mongoose';
import { Roles, modules } from '../utils/utils';
@Controller('employee')
@ApiTags('Employee')
@ApiBearerAuth('JWT')
export class EmployeeController {
  constructor(
    @InjectModel('Employee') private Employee: Model<any>,
    private readonly employeeService: EmployeeService,
    private readonly departmentService: DepartmentService,
    private readonly experienceService: ExperienceService,
    private readonly correctionReqService: CorrectionReqService,
    private readonly designationService: DesignationService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all employees',
    description: 'Retrieve all employees from the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all employees.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async all(@Req() req: Request, @Res() res: Response) {
    try {
      const myEmployee = await this.Employee.find({});
      return res.status(200).json({ myEmployee });
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  }
  @Post('register')
  @ApiOperation({
    summary: 'Register a new employee',
    description: 'Create a new employee with the provided details.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        fatherName: { type: 'string' },
        cnic: { type: 'string' },
        profileImg: { type: 'string' },
        contact: { type: 'string' },
        emergencyContact: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        role: { type: 'number' },
        moduleAccess: { type: 'array', items: { type: 'number' } },
      },
    },
    description: 'Details of the new employee to be registered.',
  })
  @ApiQuery({
    name: 'did',
    type: 'string',
    description: 'Department ID to associate the employee with.',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully registered new employee.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'Insufficient data or Associated Department not found.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @UseGuards(JwtAuthGuard)
  async register(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: CreateUserDto,
    @Query() query: IdQueryRequestDto,
  ) {
    const {
      name,
      fatherName,
      cnic,
      profileImg,
      contact,
      emergencyContact,
      email,
      password,
      role = 0,
    } = body;
    const { did } = query;
    let { moduleAccess }: any = body;
    if (moduleAccess?.length > 1) {
      moduleAccess =
        this.employeeService.removeDuplicatesFromModuleAccessArray(
          moduleAccess,
        );
    }
    try {
      if (
        !name ||
        !fatherName ||
        !cnic ||
        !contact ||
        !emergencyContact ||
        !email ||
        !password ||
        !did
      ) {
        res.status(404);
        throw new Error('Insufficient data');
      }
      const myDept = await this.departmentService.giveMyDept(did);
      if (!myDept) {
        res.status(404);
        throw new Error('associated Department not found');
      }

      const obayedRules: any =
        await this.employeeService.roleRulesToRegisterUser(
          req,
          role,
          moduleAccess,
          modules.indexOf('employee'),
        );

      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const newEmployee = await this.Employee.create({
        name,
        fatherName,
        cnic,
        profileImg,
        contact,
        emergencyContact,
        email,
        password,
        role,
        moduleAccess: role === Roles.indexOf('subAdmin') ? moduleAccess : [],
      });
      await newEmployee.save();
      await myDept.EID.push(newEmployee._id);
      await myDept.save();
      res.status(201).json({ newEmployee });
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Post('login')
  @ApiOperation({
    summary: 'Employee login',
    description: 'Authenticate an employee with provided email and password.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Employee email' },
        password: { type: 'string', description: 'Employee password' },
      },
    },
    description: 'Credentials for employee authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or Insufficient credentials.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: AuthUserDto,
  ) {
    const { email, password } = body;
    try {
      if (!email || !password) {
        res.status(401);
        throw new Error('Insufficient credentials');
      }
      const user = await this.Employee.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        res.status(401);
        throw new UnauthorizedException();
      }
      const myToken = await this.employeeService.generateJWT(user._id);
      return res.status(200).json({ user, myToken });
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('update')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update employee',
    description: 'Update information for the authenticated employee.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            fatherName: { type: 'string' },
            cnic: { type: 'string' },
            profileImg: { type: 'string' },
            contact: { type: 'string' },
            emergencyContact: { type: 'string' },
          },
        },
      },
    },
    description: 'Data for updating the employee information.',
  })
  @ApiQuery({
    name: 'id',
    description: 'Employee ID',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully updated employee information.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or Insufficient data.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async updateEmp(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: UpdateUserRequestDto,
    @Query() query: IdQueryRequestDto,
  ) {
    try {
      const { id } = query;
      const { data } = body;
      if (!id) {
        res.status(401);
        throw new Error('Insiffient data');
      }
      const obayedRules = await this.employeeService.roleRulesToUpdateUser(
        req,
        id,
        modules.indexOf('employee'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const updatedUser = await this.Employee.findByIdAndUpdate(id, data, {
        new: true,
      });
      res.status(201).json(updatedUser);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete employee',
    description: 'Delete information for the authenticated employee.',
  })
  @ApiQuery({
    name: 'id',
    description: 'Employee ID',
    type: 'string',
    required: true,
  })
  @ApiQuery({
    name: 'did',
    description: 'Department ID',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully deleted employee information.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or Insufficient data.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async deleteEmp(
    @Req() req: any,
    @Res() res: Response,
    @Query() query: IdQueryRequestDto,
  ) {
    try {
      const { id, did } = query;
      if (!id || !did) {
        res.status(401);
        throw new Error('Insiffient data');
      }
      const myDept = this.departmentService.giveMyDept(did);
      if (!myDept) {
        res.status(401);
        throw new Error('Department not exist');
      }
      const obayedRiles = await this.employeeService.roleRulesToUpdateUser(
        req,
        id,
        modules.indexOf('employee'),
      );
      if (!obayedRiles.status) {
        res.status(401);
        throw new Error(obayedRiles.error);
      }
      const deletedUser = await this.Employee.findByIdAndDelete(id);
      const remEmpFromDept = await this.departmentService.remEmployeeFromDept(
        did,
        id,
      );
      const exId = deletedUser.EXID;
      const crIds = deletedUser.CRID;
      const desgId = deletedUser.DESGID;
      if (exId) {
        const myExperience =
          await this.experienceService.giveMyExperience(exId);
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
          await this.experienceService.delMyExperience(exId);
        }
      }
      if (crIds.length > 0) {
        for (const crId of crIds) {
          await this.correctionReqService.delMyCorrectionReq(crId);
        }
      }
      if (desgId) {
        await this.designationService.delMyDesignation(desgId);
      }
      res.status(201).json({ deletedUser, remEmpFromDept });
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/module/access/change')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Change module access',
    description: 'Update module access for the authenticated employee.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        moduleAccess: { type: 'array', items: { type: 'number' } },
      },
    },
    description:
      'Data for changing module access for the employee. (please add all the modules access while increasing access)',
  })
  @ApiQuery({
    name: 'id',
    description: 'Employee ID',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully changed module access.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or Insufficient data.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async changeModuleAccess(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: ModuleAccessRequestDto,
    @Query() query: IdQueryRequestDto,
  ) {
    const { id } = query;
    let { moduleAccess }: any = body;
    if (moduleAccess?.length > 1) {
      moduleAccess =
        this.employeeService.removeDuplicatesFromModuleAccessArray(
          moduleAccess,
        );
    }
    try {
      if (!id || moduleAccess.length <= 0) {
        res.status(404);
        throw new Error('Insufficient Data');
      }
      const obayedRule =
        await this.employeeService.roleRuleToChangeRoleOrModuleAccess(
          req,
          id,
          'module',
          null,
        );
      if (!obayedRule.status) {
        res.status(401);
        throw new Error(obayedRule.error);
      }

      const newAccess = await this.Employee.findByIdAndUpdate(
        id,
        { moduleAccess },
        {
          new: true,
        },
      );

      res.status(201).json(newAccess);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/role/access/change')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Change employee role and access',
    description: 'Change the role and access for the authenticated employee.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'number',
          description: 'New role for the employee.',
        },
      },
      required: ['role'],
    },
    description: 'Data for changing the employee role and access.',
  })
  @ApiQuery({
    name: 'id',
    description: 'Employee ID',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully changed employee role and access.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or Insufficient data.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async changeRoleAccess(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: RoleRequestDto,
    @Query() query: IdQueryRequestDto,
  ) {
    const { id } = query;
    const { role } = body;

    try {
      if (!id) {
        res.status(404);
        throw new Error('Insufficient Data');
      }
      const obayedRule =
        await this.employeeService.roleRuleToChangeRoleOrModuleAccess(
          req,
          id,
          'role',
          role,
        );
      if (!obayedRule.status) {
        res.status(401);
        throw new Error(obayedRule.error);
      }
      //added the rule if role is changing from sub admin to any other
      //class then vanish it's module access.
      const getCurrentUser = await this.Employee.findById(id);
      let decideToVanish = false;
      const myRole = getCurrentUser.role;
      if (myRole !== role) {
        if (myRole === Roles.indexOf('subAdmin')) {
          decideToVanish = true;
        }
      }
      const newAccess = await this.Employee.findByIdAndUpdate(
        id,
        {
          role,
          moduleAccess: decideToVanish ? [] : getCurrentUser.moduleAccess,
        },
        {
          new: true,
        },
      );

      res.status(201).json(newAccess);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/status/inactive')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Change employee to inactive status',
    description: 'Change the inactive status for the authenticated employee.',
  })
  @ApiQuery({
    name: 'id',
    description: 'Employee ID',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully changed employee inactive status.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or Insufficient data.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async changeToInactiveStatus(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: RoleRequestDto,
    @Query() query: IdQueryRequestDto,
  ) {
    const { id } = query;

    try {
      if (!id) {
        res.status(404);
        throw new Error('Insufficient Data');
      }
      const obayedRule = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('employee'),
      );
      if (!obayedRule.status) {
        res.status(401);
        throw new Error(obayedRule.error);
      }
      const changeMyStatus = await this.Employee.findByIdAndUpdate(
        id,
        {
          status: 1,
        },
        {
          new: true,
        },
      );
      res.status(201).json(changeMyStatus);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/status/active')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Change employee active status',
    description: 'Change the active status for the authenticated employee.',
  })
  @ApiQuery({
    name: 'id',
    description: 'Employee ID',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully changed employee active status.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or Insufficient data.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async changeToActiveStatus(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: RoleRequestDto,
    @Query() query: IdQueryRequestDto,
  ) {
    const { id } = query;

    try {
      if (!id) {
        res.status(404);
        throw new Error('Insufficient Data');
      }
      const obayedRule = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('employee'),
      );
      if (!obayedRule.status) {
        res.status(401);
        throw new Error(obayedRule.error);
      }
      const changeMyStatus = await this.Employee.findByIdAndUpdate(
        id,
        {
          status: 0,
        },
        {
          new: true,
        },
      );
      res.status(201).json(changeMyStatus);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
}
