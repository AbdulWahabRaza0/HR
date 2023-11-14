import {
  Controller,
  Get,
  //   Post,
  Put,
  Query,
  Req,
  Res,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';
import { DesignationService } from './designation.service';
import { EmployeeService } from 'src/employee/employee.service';
import {
  DesgReqDto,
  EIdQueryReqDto,
  DESGIdQueryReqDto,
  EDESGIdQueryReqDto,
} from './designation.dtos';
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
import { Model } from 'mongoose';
import { modules } from 'src/utils/utils';
@Controller('employee/designation')
@ApiTags('Designation')
@ApiBearerAuth('JWT')
export class DesignationController {
  constructor(
    @InjectModel('Designation') private Designation: Model<any>,
    private readonly employeeService: EmployeeService,
    private readonly designationService: DesignationService,
  ) {}
  @Get()
  @ApiOperation({
    summary: 'Get all designations',
    description: 'Retrieve a list of all designations.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved designations.',
    type: Object,
    isArray: true,
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async allDesignations(@Req() req: Request, @Res() res: Response) {
    try {
      const fetchingDesignations = await this.Designation.find({});
      res.status(200).json(fetchingDesignations);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get my designation',
    description:
      'Retrieve the designation of the currently authenticated user.',
  })
  @ApiBearerAuth() // Specify that this endpoint requires authentication using a bearer token
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved my designation.',
    type: Object,
  }) // Adjust the type based on your Designation model
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async myDesignation(@Req() req: any, @Res() res: Response) {
    try {
      const myExmployee = await this.employeeService.findUserByReq(req);
      const mine = await this.designationService.giveMyDesignation(
        myExmployee.DESGID,
      );
      res.status(200).json(mine);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('add')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Add designation for the authenticated user',
    description: 'Add a new designation for the authenticated user.',
  })
  // @ApiBearerAuth() // Specify that this endpoint requires authentication using a bearer token
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            deptName: { type: 'string' },
            salary: { type: 'number' },
          },
        },
      },
    },
  }) // Specify the request body DTO
  @ApiQuery({ type: EIdQueryReqDto, name: 'eid' }) // Specify the query parameter DTO
  @ApiResponse({ status: 201, description: 'Successfully added designation.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'Insufficient data or Employee not found.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async addDesignation(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: DesgReqDto,
    @Query() query: EIdQueryReqDto,
  ) {
    const { data } = body;
    const { eid } = query;
    try {
      if (!Boolean(data) || !eid) {
        res.status(404);
        throw new Error('Insufficient data');
      }
      const findingMyEmp: any = await this.employeeService.giveMyEmployee(eid);

      if (!findingMyEmp) {
        res.status(404);
        throw new Error('Employee not found');
      }
      const obayedRules: any = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('employee'),
      );

      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const newDesignation = await this.Designation.create(data);
      await newDesignation.save();
      findingMyEmp.DESGID = newDesignation._id;
      await findingMyEmp.save();
      res.status(201).json({ newDesignation, findingMyEmp });
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('update')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update designation for the authenticated user',
    description: 'Update the existing designation for the authenticated user.',
  })
  // @ApiBearerAuth() // Specify that this endpoint requires authentication using a bearer token
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            deptName: { type: 'string' },
            salary: { type: 'number' },
          },
        },
      },
    },
  }) // Specify the request body DTO
  @ApiQuery({ type: DESGIdQueryReqDto, name: 'desgId' }) // Specify the query parameter DTO
  @ApiResponse({
    status: 201,
    description: 'Successfully updated designation.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Insufficient data.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async updateDesignation(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: DesgReqDto,
    @Query() query: DESGIdQueryReqDto,
  ) {
    const { data } = body;
    const { desgId } = query;
    try {
      if (!Boolean(data) || !desgId) {
        res.status(404);
        throw new Error('Insufficient data');
      }
      const obayedRules: any = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('employee'),
      );

      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const updateDesignation = await this.Designation.findByIdAndUpdate(
        desgId,
        data,
        {
          new: true,
        },
      );

      res.status(201).json({ updateDesignation });
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Delete('/delete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete designation for the authenticated user',
    description: 'Delete the existing designation for the authenticated user.',
  })
  // @ApiBearerAuth() // Specify that this endpoint requires authentication using a bearer token
  @ApiQuery({ type: EDESGIdQueryReqDto, name: 'eid' }) // Specify the query parameter DTO for 'eid'
  @ApiQuery({ type: EDESGIdQueryReqDto, name: 'desgId' }) // Specify the query parameter DTO for 'desgId'
  @ApiResponse({
    status: 201,
    description: 'Successfully deleted designation.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Insufficient data.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async deleteDesignation(
    @Req() req: any,
    @Res() res: Response,
    @Query() query: EDESGIdQueryReqDto,
  ) {
    const { eid, desgId } = query;
    try {
      if (!desgId || !eid) {
        res.status(404);
        throw new Error('Insufficient data');
      }
      const findingMyEmp: any = await this.employeeService.giveMyEmployee(eid);

      if (!findingMyEmp) {
        res.status(404);
        throw new Error('Employee not found');
      }
      const obayedRules: any = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('employee'),
      );

      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const delDesignation = await this.Designation.findByIdAndDelete(desgId);
      findingMyEmp.DESGID = null;
      await findingMyEmp.save();
      res.status(201).json({ delDesignation });
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
}
