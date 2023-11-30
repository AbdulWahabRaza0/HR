/* eslint-disable @typescript-eslint/no-unused-vars */
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
import {
  ApiTags,
  //   ApiOperation,
  //   ApiOkResponse,
  //   ApiBadRequestResponse,
  //   ApiBody,
  ApiBearerAuth,
  //   ApiResponse,
  //   ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeService } from '../employee/employee.service';
import { TANDAService } from './tAndA.service';
import { JwtAuthGuard } from '../auth/jwt-auth.gaurd';
import { modules } from 'src/utils/utils';
@Controller('employee/experience')
@ApiTags('Experience')
@ApiBearerAuth('JWT')
export class TANDAController {
  constructor(
    @InjectModel('TimeAndAttendance') private TimeAndAttendance: Model<any>,
    @InjectModel('LeaveReq') private LeaveReq: Model<any>,
    private readonly employeeService: EmployeeService,
    private readonly tAndAService: TANDAService,
  ) {}
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAttendance(@Req() req: any, @Res() res: Response) {
    try {
      if (!req) {
        return res.status(401).json('User not found');
      }
      const obayedRules = await this.employeeService.roleRulesSubAdminTypical(
        req,
        modules.indexOf('attendance'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const myAttendance = this.employeeService.giveMyAttendance(req._id);
      if (!myAttendance) {
        return res.status(404).json('attendance not found');
      } else {
        return res.status(200).json(myAttendance);
      }
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
}
