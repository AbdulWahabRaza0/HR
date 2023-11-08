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
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { DepartmentService } from './department.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';
import { CreateDeptDto } from './department.dtos';
import { EmployeeService } from 'src/employee/employee.service';
import { Model } from 'mongoose';
import { modules } from 'src/utils/utils';
import { UpdateDeptRequestDto, IdQueryRequestDto } from './department.dtos';
import { IsBoolean } from 'class-validator';
@Controller('department')
export class DepartmentController {
  constructor(
    @InjectModel('Department') private Department: Model<any>,
    private readonly departmentService: DepartmentService,
    private readonly employeeService: EmployeeService,
  ) {}
  @Get()
  async allDepartments(@Req() req: Request, @Res() res: Response) {
    try {
      const depts = await this.Department.find({});
      res.status(200).json(depts);
    } catch (e) {
      console.log(e);
      res.status(500);
      throw new Error('Invalid Error');
    }
  }
  @Post('register')
  @UseGuards(JwtAuthGuard)
  async register(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: CreateDeptDto,
  ) {
    const { name, email, contact, profileImg } = body;
    try {
      if (!name || !email || !contact) {
        res.status(404);
        throw new Error('Insufficient details');
      }
      //check for unique epartment
      const checkforDuplicate = await this.Department.findOne({ name });
      if (checkforDuplicate) {
        res.status(404);
        throw new Error('Department already exists');
      }
      //check for user role access
      const obayedRules: any = await this.departmentService.roleRulesDepartment(
        req,
        modules.indexOf('department'),
      );

      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      //adding new department
      const newDep = await this.Department.create({
        name,
        email,
        contact,
        profileImg,
      });
      await newDep.save();
      return res.status(201).json(newDep);
    } catch (e) {
      console.log(e);
      throw new Error('Invalid Error');
    }
  }
  @Put('update')
  @UseGuards(JwtAuthGuard)
  async updateDept(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: UpdateDeptRequestDto,
    @Query() query: IdQueryRequestDto,
  ) {
    const { id } = query;
    const { data } = body;
    try {
      if (!id) {
        res.status(401);
        throw new Error('Insiffient data');
      }
      if (IsBoolean(data?.EID)) {
        delete data.EID;
      }
      //check for user role access
      const obayedRules: any = await this.departmentService.roleRulesDepartment(
        req,
        modules.indexOf('department'),
      );

      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      //updating department data
      const updateDept = await this.Department.findByIdAndUpdate(id, data, {
        new: true,
      });
      res.status(201).json(updateDept);
    } catch (e) {
      console.log(e);
      res.status(500);
      throw new Error('Invalid Error');
    }
  }
  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  async deleteDept(
    @Req() req: any,
    @Res() res: Response,
    @Query() query: IdQueryRequestDto,
  ) {
    const { id } = query;
    try {
      if (!id) {
        res.status(401);
        throw new Error('Insiffient data');
      }
      //check for user role access
      const obayedRules: any = await this.departmentService.roleRulesDepartment(
        req,
        modules.indexOf('department'),
      );

      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      //updating department data
      const delDept = await this.Department.findByIdAndDelete(id);
      res.status(201).json(delDept);
    } catch (e) {
      console.log(e);
      res.status(500);
      throw new Error('Invalid Error');
    }
  }
}
