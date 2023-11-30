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
@Controller('employee/attendance')
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
      if (!req.user) {
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
      const myAttendance = await this.employeeService.giveMyAttendance(
        req.user.userId,
      );
      if (!myAttendance) {
        return res.status(404).json('attendance not found');
      } else {
        const myAttendanceIs =
          await this.TimeAndAttendance.findById(myAttendance);
        return res.status(200).json(myAttendanceIs);
      }
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Get('checkin')
  @UseGuards(JwtAuthGuard)
  async checkIn(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
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
      let myAttendance = null;
      console.log('This is user ', req.user);
      do {
        myAttendance = await this.employeeService.giveMyAttendance(
          req.user.userId,
        );
        if (!myAttendance) {
          const myNewAttendanceRegister = new this.TimeAndAttendance();
          if (!myNewAttendanceRegister) {
            res.status(401);
            throw new Error('something went wrong!');
          }
          await myNewAttendanceRegister.save();
          myAttendance = myNewAttendanceRegister;
          const myEmployee = await this.employeeService.giveMyEmployee(
            req.user.userId,
          );
          if (!myEmployee) {
            res.status(401);
            throw new Error('User not found!');
          }

          myEmployee.TAID = myNewAttendanceRegister._id;
          await myEmployee.save();
        } else {
          break;
        }
      } while (!myAttendance);

      const myAttendanceRegister =
        await this.TimeAndAttendance.findById(myAttendance);
      //if employee has done checkin already then he cannot do checkin again
      if (myAttendanceRegister.checkInConfirmed) {
        return res.status(401).json('please do checkout before checkin');
      } else {
        myAttendanceRegister.checkInConfirmed = true;
        myAttendanceRegister.presentHoursTimeStamp = Date.now();
        await myAttendanceRegister.save();
        return res.status(201).json(myAttendanceRegister);
      }
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }

  @Get('checkout')
  @UseGuards(JwtAuthGuard)
  async checkOut(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
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
      const myEmployee = await this.employeeService.giveMyEmployee(
        req.user.userId,
      );
      if (!myEmployee) {
        res.status(401);
        throw new Error('User not found!');
      } else if (!myEmployee.TAID) {
        res.status(401);
        throw new Error('do check in there is something wrong with attendance');
      }

      const myAttendanceRegister = await this.TimeAndAttendance.findById(
        myEmployee.TAID,
      );
      //if employee has done checkin already then he cannot do checkin again
      if (!myAttendanceRegister.checkInConfirmed) {
        return res.status(401).json('please do check out before checkin');
      } else {
        myAttendanceRegister.checkInConfirmed = false;
        const myLastTimeStamp = myAttendanceRegister.presentHoursTimeStamp;
        const currentTimeStamp = Date.now();
        const myHoursAndMins = this.tAndAService.calculateTimeDifference(
          myLastTimeStamp,
          currentTimeStamp,
        );
        myAttendanceRegister.presentHours.push(myHoursAndMins);
        await myAttendanceRegister.save();
        return res.status(201).json(myAttendanceRegister);
      }
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Get('breakon')
  @UseGuards(JwtAuthGuard)
  async breakOn(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
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
      const myEmployee = await this.employeeService.giveMyEmployee(
        req.user.userId,
      );
      if (!myEmployee) {
        res.status(401);
        throw new Error('User not found!');
      } else if (!myEmployee.TAID) {
        res.status(401);
        throw new Error('please do check in...');
      }

      const myAttendanceRegister = await this.TimeAndAttendance.findById(
        myEmployee.TAID,
      );
      //if employee has done checkin already then he cannot do checkin again
      if (myAttendanceRegister.breakOnConfirmed) {
        return res.status(401).json('please do break off before break on');
      } else {
        myAttendanceRegister.breakOnConfirmed = true;
        myAttendanceRegister.breakHourTimestamp = Date.now();
        await myAttendanceRegister.save();
        return res.status(201).json(myAttendanceRegister);
      }
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }

  @Get('breakoff')
  @UseGuards(JwtAuthGuard)
  async breakOff(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
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
      const myEmployee = await this.employeeService.giveMyEmployee(
        req.user.userId,
      );
      if (!myEmployee) {
        res.status(401);
        throw new Error('User not found!');
      } else if (!myEmployee.TAID) {
        res.status(401);
        throw new Error('do check in there is something wrong with attendance');
      }

      const myAttendanceRegister = await this.TimeAndAttendance.findById(
        myEmployee.TAID,
      );
      //if employee has done checkin already then he cannot do checkin again
      if (!myAttendanceRegister.breakOnConfirmed) {
        return res.status(401).json('please do break on before break off');
      } else {
        myAttendanceRegister.breakOnConfirmed = false;
        const myLastTimeStamp = myAttendanceRegister.breakHourTimestamp;
        const currentTimeStamp = Date.now();
        const myHoursAndMins = this.tAndAService.calculateTimeDifference(
          myLastTimeStamp,
          currentTimeStamp,
        );
        myAttendanceRegister.breakHour.push(myHoursAndMins);
        await myAttendanceRegister.save();
        return res.status(201).json(myAttendanceRegister);
      }
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/leave/request')
  @UseGuards(JwtAuthGuard)
  async leaveRequest(
    @Req() req: any,
    @Res() res: Response,
    @Query() query: any,
  ) {
    try {
      const { taid } = query;
      if (!req.user || !taid) {
        return res.status(401).json('Insufficient details');
      }
      const obayedRules = await this.employeeService.roleRulesSubAdminTypical(
        req,
        modules.indexOf('attendance'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }

      const myAttendanceRegister = await this.TimeAndAttendance.findById(taid);
      if (!myAttendanceRegister) {
        res.status(401);
        throw new Error('Attendance not found');
      }
      const myLeaveRequests = myAttendanceRegister.LRID
        ? myAttendanceRegister.populate({
            path: 'LeaveReq',
            options: { strictPopulate: false },
          })
        : [];
      return res.status(200).json(myLeaveRequests);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/leave/request/add')
  @UseGuards(JwtAuthGuard)
  async addLeaveRequest(
    @Req() req: any,
    @Res() res: Response,
    @Query() query: any,
    @Body() body: any,
  ) {
    try {
      const { taid } = query;
      const { subject, description, duration } = body;
      if (!req.user || !taid || !subject || !description || !duration) {
        return res.status(401).json('Insufficient details');
      }
      const obayedRules = await this.employeeService.roleRulesSubAdminTypical(
        req,
        modules.indexOf('attendance'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }

      const myAttendanceRegister = await this.TimeAndAttendance.findById(taid);
      if (!myAttendanceRegister) {
        res.status(401);
        throw new Error('Attendance not found');
      }
      const newLeaveReq = await this.LeaveReq.create({
        subject,
        description,
        duration,
      });
      await newLeaveReq.save();
      myAttendanceRegister.LRID.push(newLeaveReq._id);
      await myAttendanceRegister.save();
      return res.status(200).json(myAttendanceRegister);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/leave/request/edit')
  @UseGuards(JwtAuthGuard)
  async editLeaveRequest(
    @Req() req: any,
    @Res() res: Response,
    @Query() query: any,
    @Body() body: any,
  ) {
    try {
      const { taid, lrid } = query;
      const { data } = body;
      if (!req.user || !taid || !lrid || !data) {
        return res.status(401).json('Insufficient details');
      }
      const obayedRules = await this.employeeService.roleRulesSubAdminTypical(
        req,
        modules.indexOf('attendance'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }

      const myAttendanceRegister = await this.TimeAndAttendance.findById(taid);
      if (!myAttendanceRegister) {
        res.status(401);
        throw new Error('Attendance not found');
      }
      const newLeaveReq = await this.LeaveReq.findByIdAndUpdate(lrid, data, {
        new: true,
      });
      return res.status(200).json(newLeaveReq);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Delete('/leave/request/delete')
  @UseGuards(JwtAuthGuard)
  async deleteLeaveRequest(
    @Req() req: any,
    @Res() res: Response,
    @Query() query: any,
    @Body() body: any,
  ) {
    try {
      const { taid, lrid } = query;

      if (!req.user || !taid || !lrid) {
        return res.status(401).json('Insufficient details');
      }
      const obayedRules = await this.employeeService.roleRulesSubAdminTypical(
        req,
        modules.indexOf('attendance'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }

      const myAttendanceRegister =
        await this.TimeAndAttendance.findByIdAndUpdate(taid, {
          $pull: { LRID: lrid },
        });
      if (!myAttendanceRegister) {
        res.status(401);
        throw new Error('Attendance not found');
      }
      const newLeaveReq = await this.LeaveReq.findByIdAndDelete(lrid, {
        new: true,
      });
      return res.status(200).json(newLeaveReq);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
}
