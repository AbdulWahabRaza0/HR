import { Controller, Get, Post, Req, Res, Body } from '@nestjs/common';
import { Response, Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { EmployeeService } from './employee.service';
import { CreateUserDto, AuthUserDto } from './employee.dtos';
import { Model } from 'mongoose';
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
  async register(
    @Req() req: Request,
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
      //replace false with variable which define current acess as admin
      if (false && role === 1 && moduleAccess?.length <= 0) {
        res.status(404);
        throw new Error('Admin has not provided any permission to sub admin');
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
      res.status(201).json(newEmployee);
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
        throw new Error('Unauthorized users');
      }
      return res.status(200).json(user);
    } catch (e) {
      console.log(e);
      res.status(500);
      throw new Error(e);
    }
  }
}
