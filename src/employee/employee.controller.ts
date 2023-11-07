import {
  Controller,
  Get,
  Post,
  Put,
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
import {
  CreateUserDto,
  AuthUserDto,
  UpdateUserRequestDto,
  IdQueryRequestDto,
} from './employee.dtos';
import { JwtAuthGuard } from '../auth/jwt-auth.gaurd';
import { Model } from 'mongoose';
import { modules } from '../utils/utils';
@Controller('employee')
export class EmployeeController {
  constructor(
    @InjectModel('Employee') private Employee: Model<any>,
    private readonly employeeService: EmployeeService,
  ) {}

  @Get()
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
  @UseGuards(JwtAuthGuard)
  async register(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: CreateUserDto,
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
      moduleAccess,
    } = body;
    try {
      if (
        !name ||
        !fatherName ||
        !cnic ||
        !contact ||
        !emergencyContact ||
        !email ||
        !password
      ) {
        res.status(404);
        throw new Error('Insufficient data');
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
        moduleAccess,
      });
      await newEmployee.save();

      res.status(201).json({ newEmployee });
    } catch (e) {
      console.log(e);
      res.status(401);
      throw new Error('Invalid Error');
    }
  }
  @Post('login')
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
      res.status(500);
      throw new Error(e);
    }
  }
  @Put('update')
  @UseGuards(JwtAuthGuard)
  async updateEmp(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: UpdateUserRequestDto,
    @Query() query: IdQueryRequestDto,
  ) {
    try {
      const { id } = query;
      const { data } = body;
      if (!id || data.length <= 0) {
        res.status(401);
        throw new Error('Insiffient data');
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
      const updatedUser = await this.Employee.findByIdAndUpdate(id, data, {
        new: true,
      });
      res.status(201).json(updatedUser);
    } catch (e) {
      console.log(e);
      res.status(500);
      throw new Error(e);
    }
  }
  @Put('delete')
  @UseGuards(JwtAuthGuard)
  async deleteEmp(
    @Req() req: any,
    @Res() res: Response,
    @Query() query: IdQueryRequestDto,
  ) {
    try {
      const { id } = query;
      if (!id) {
        res.status(401);
        throw new Error('Insiffient data');
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
      res.status(201).json(deletedUser);
    } catch (e) {
      console.log(e);
      res.status(500);
      throw new Error(e);
    }
  }
}
