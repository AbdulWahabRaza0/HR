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
import { Model } from 'mongoose';
import { modules } from 'src/utils/utils';
@Controller('employee/designation')
export class DesignationController {
  constructor(
    @InjectModel('Designation') private Designation: Model<any>,
    private readonly employeeService: EmployeeService,
    private readonly designationService: DesignationService,
  ) {}
  @Get()
  async allDesignations(@Req() req: Request, @Res() res: Response) {
    try {
      const fetchingDesignations = await this.Designation.find({});
      res.status(200).json(fetchingDesignations);
    } catch (e) {
      console.log(e);
      res.status(500);
      throw new Error(e);
    }
  }
  @Put('add')
  @UseGuards(JwtAuthGuard)
  async addDesignation(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
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
      res.status(200);
      throw new Error('Invalid Error');
    }
  }
  @Put('update')
  @UseGuards(JwtAuthGuard)
  async updateDesignation(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
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
      res.status(200);
      throw new Error('Invalid Error');
    }
  }
  @Delete('/delete')
  @UseGuards(JwtAuthGuard)
  async deleteDesignation(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
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
      res.status(200);
      throw new Error('Invalid Error');
    }
  }
}