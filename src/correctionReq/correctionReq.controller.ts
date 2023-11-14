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
import { CorrectionReqService } from './correctionReq.service';
import { EmployeeService } from 'src/employee/employee.service';
import {
  CorrectionReqRequestDto,
  EIdQueryRequestDto,
  CRIDQueryRequestDto,
  ECRIDQueryRequestDto,
} from './correctionReq.dtos';
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
@Controller('employee/correction/req')
@ApiTags('Correction Req')
@ApiBearerAuth('JWT')
export class CorrectionReqController {
  constructor(
    @InjectModel('CorrectionReq') private CorrectionReq: Model<any>,
    private readonly correctionReqService: CorrectionReqService,
    private readonly employeeService: EmployeeService,
  ) {}
  @Get()
  @ApiOperation({
    summary: 'Get all corrections',
    description: 'Get a list of all correction requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all corrections.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async allCorrections(@Req() req: Request, @Res() res: Response) {
    try {
      const all = await this.CorrectionReq.find({});
      res.status(200).json(all);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get my correction requests',
    description:
      'Get correction requests associated with the authenticated employee.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved correction requests.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async myCorrectionReq(@Req() req: any, @Res() res: Response) {
    try {
      const myExmployee = await this.employeeService.findUserByReq(req);
      const myArr = [];
      if (myExmployee.CRID.length > 0) {
        for (const crid of myExmployee.CRID) {
          const mine =
            await this.correctionReqService.findMyCorrectionReq(crid);
          myArr.push(mine);
        }
      }
      res.status(200).json(myArr);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/add')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Add correction request',
    description: 'Add a correction request for the specified employee.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'eid',
    type: 'string',
    description: 'Employee ID to associate the correction request with.',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully added correction request.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or Insufficient data.',
  })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async addCorrection(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CorrectionReqRequestDto,
    @Query() query: EIdQueryRequestDto,
  ) {
    try {
      const { eid } = query;
      const { data } = body;
      if (!eid || !data) {
        res.status(401);
        throw new Error('Insufficient data');
      }
      const myEmp = await this.employeeService.giveMyEmployee(eid);
      if (!myEmp) {
        res.status(404);
        throw new Error('Employee not found');
      }
      const obayedRules = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('correctionReq'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const myCorrectionReq = await this.CorrectionReq.create(data);
      await myCorrectionReq.save();
      await myEmp.CRID.push(myCorrectionReq._id);
      await myEmp.save();
      res.status(201).json({ myEmp, myCorrectionReq });
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/update')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update correction request',
    description: 'Update the details of a correction request.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'number', enum: [0, 1, 2] },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'crid',
    description: 'Correction Request ID',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully updated correction request.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or Insufficient data.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async updateCorrection(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CorrectionReqRequestDto,
    @Query() query: CRIDQueryRequestDto,
  ) {
    try {
      const { crid } = query;
      const { data } = body;
      if (!crid || !data) {
        res.status(401);
        throw new Error('Insufficient data');
      }
      const obayedRules = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('correctionReq'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const myCorrectionReq = await this.CorrectionReq.findByIdAndUpdate(
        crid,
        data,
        {
          new: true,
        },
      );
      await myCorrectionReq.save();
      res.status(201).json(myCorrectionReq);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Delete('/delete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete correction request',
    description: 'Delete a correction request associated with an employee.',
  })
  @ApiQuery({
    name: 'eid',
    description: 'Employee ID',
    type: 'string',
    required: true,
  })
  @ApiQuery({
    name: 'crid',
    description: 'Correction Request ID',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully deleted correction request.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or Insufficient data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found or Operation unsuccessful.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async deleteCorrection(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: ECRIDQueryRequestDto,
  ) {
    try {
      const { eid, crid } = query;
      if (!eid || !crid) {
        res.status(401);
        throw new Error('Insufficient data');
      }
      const myEmp = await this.employeeService.giveMyEmployee(eid);
      if (!myEmp) {
        res.status(404);
        throw new Error('Employee not found');
      }
      const obayedRules = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('correctionReq'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const myCorrectionReq = await this.CorrectionReq.findByIdAndDelete(crid);
      if (!myCorrectionReq) {
        res.status(401);
        throw new Error('Operation unsuccessful');
      }
      const remEmpFromDept =
        await this.employeeService.remCorrectionreqFromEmployee(eid, crid);
      res.status(201).json({ remEmpFromDept, myCorrectionReq });
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
}
