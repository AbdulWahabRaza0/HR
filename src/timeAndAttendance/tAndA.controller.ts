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
  ApiOperation,
  //   ApiOkResponse,
  //   ApiBadRequestResponse,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeService } from '../employee/employee.service';
import { TANDAService } from './tAndA.service';
import { JwtAuthGuard } from '../auth/jwt-auth.gaurd';
import { modules } from '../utils/utils';
@Controller('employee/attendance')
@ApiTags('Attendance')
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
  @ApiOperation({
    summary: 'Get user attendance',
    operationId: 'getAttendance',
  })
  @ApiResponse({
    status: 200,
    description: 'User attendance details',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Attendance not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
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
      const myUser = await this.employeeService.findUserByReq(req);
      if (!myUser) {
        return res.status(401).json('User not found');
      }
      const myAttendance = await this.employeeService.giveMyAttendance(
        myUser._id,
      );
      if (!myAttendance) {
        return res.status(401).json('attendance not found');
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
  @ApiOperation({ summary: 'Check-in for attendance', operationId: 'checkIn' })
  @ApiResponse({
    status: 201,
    description: 'Check-in successful',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
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
  @ApiOperation({
    summary: 'Check-out for attendance',
    operationId: 'checkOut',
  })
  @ApiResponse({
    status: 201,
    description: 'Check-out successful',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
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
  @ApiOperation({
    summary: 'Start break for attendance',
    operationId: 'breakOn',
  })
  @ApiResponse({
    status: 201,
    description: 'Break started successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
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
  @ApiOperation({
    summary: 'End break for attendance',
    operationId: 'breakOff',
  })
  @ApiResponse({
    status: 201,
    description: 'Break ended successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
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
  @Put('specific')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'get a specific attendance',
    operationId: 'attendance',
    description: 'pass a time and attendance parameter to get attendance',
  })
  @ApiQuery({
    name: 'taid',
    description: 'Attendance ID',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request submitted successfully',
  })
  @ApiResponse({ status: 401, description: 'Insufficient details' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getSpecificAttendance(
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
        ? await myAttendanceRegister.populate({
            path: 'LRID',
            options: { strictPopulate: false },
          })
        : [];
      return res.status(200).json(myLeaveRequests);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'get my attendance',
    operationId: 'attendance',
    description: 'get attendance',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request submitted successfully',
  })
  @ApiResponse({ status: 401, description: 'Insufficient details' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getMyAttendance(
    @Req() req: any,
    @Res() res: Response,
    @Query() query: any,
  ) {
    try {
      if (!req.user) {
        res.status(401);
        throw new Error('Invalid access');
      }
      const obayedRules = await this.employeeService.roleRulesSubAdminTypical(
        req,
        modules.indexOf('attendance'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const myDBUser = await this.employeeService.findUserByReq(req);
      if (!myDBUser?.TAID) {
        res.status(401);
        throw new Error('attendance not found');
      }
      const myAttendanceRegister = await this.TimeAndAttendance.findById(
        myDBUser.TAID,
      );
      if (!myAttendanceRegister) {
        res.status(401);
        throw new Error('Attendance not found');
      }
      const myLeaveRequests = myAttendanceRegister.LRID
        ? await myAttendanceRegister.populate({
            path: 'LRID',
            options: { strictPopulate: false },
          })
        : [];
      return res.status(200).json(myLeaveRequests);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Get('leave/request')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'get leave requests for attendance',
    operationId: 'getLeaveRequest',
    description: 'getleave request for a specific attendance ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request fetched successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Leave request not found',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getLeaveRequests(@Req() req: any, @Res() res: Response) {
    try {
      const myLeaveReq = await this.LeaveReq.find({});
      if (!myLeaveReq) {
        res.status(401);
        throw new Error('Attendance not found');
      }
      return res.status(200).json(myLeaveReq);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }

  @Put('leave/request/add')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Add a leave request for attendance',
    operationId: 'addLeaveRequest',
    description: 'Submit a leave request for a specific attendance ID.',
  })
  @ApiQuery({
    name: 'taid',
    description: 'Attendance ID',
    type: 'string',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', example: 'Vacation' },
        description: { type: 'string', example: 'Taking a short break' },
        duration: { type: 'number', example: 5 },
      },
      required: ['subject', 'description', 'duration'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request added successfully',
  })
  @ApiResponse({ status: 401, description: 'Insufficient details' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
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
  @Put('leave/request/edit')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Edit a leave request for attendance',
    operationId: 'editLeaveRequest',
    description:
      'Modify details of a leave request for a specific attendance ID.',
  })
  @ApiQuery({
    name: 'taid',
    description: 'Attendance ID',
    type: 'string',
    required: true,
  })
  @ApiQuery({
    name: 'lrid',
    description: 'Leave Request ID',
    type: 'string',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            // Include properties that can be edited in the LeaveReq model
            subject: { type: 'string', example: 'Updated Vacation' },
            description: { type: 'string', example: 'Updated break details' },
            duration: { type: 'number', example: 7 },
            status: { type: 'number', enum: [0, 1, 2] },
          },
        },
      },
      required: ['data'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request edited successfully',
  })
  @ApiResponse({ status: 401, description: 'Insufficient details' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
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
  @Put('leave/request/update/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update leave request status',
    description: 'Update the status of a leave request.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', enum: [0, 1, 2] },
      },
    },
  })
  @ApiQuery({
    name: 'taid',
    description: 'Time and tracking ID',
    type: 'string',
    required: true,
  })
  @ApiQuery({
    name: 'lrid',
    description: 'Leave Request Id',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully updated leave request status.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or Insufficient data.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async updateCorrectionStatus(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: { status: number },
    @Query() query: { lrid: string },
  ) {
    try {
      const { lrid } = query;
      const { status } = body;
      if (!lrid) {
        res.status(401);
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
      const myTimeAndAttend = await this.LeaveReq.findByIdAndUpdate(
        lrid,
        { status },
        {
          new: true,
        },
      );
      await myTimeAndAttend.save();
      res.status(201).json(myTimeAndAttend);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Delete('/leave/request/delete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a leave request for attendance',
    operationId: 'deleteLeaveRequest',
    description: 'Remove a leave request from a specific attendance ID.',
  })
  @ApiQuery({
    name: 'taid',
    description: 'Attendance ID',
    type: 'string',
    required: true,
  })
  @ApiQuery({
    name: 'lrid',
    description: 'Leave Request ID',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Insufficient details' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
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
