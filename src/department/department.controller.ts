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
import { DepartmentService } from './department.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';
import { CreateDeptDto } from './department.dtos';
import { Model } from 'mongoose';
@Controller('department')
export class DepartmentController {
  constructor(
    @InjectModel('Department') private Department: Model<any>,
    private readonly departmentService: DepartmentService,
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
  // @UseGuards(JwtAuthGuard)
  async register(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: CreateDeptDto,
  ) {
    const { name, email, contact, profileImg } = body;
    if (!name || !email || !contact) {
      res.status(404);
      throw new Error('Insufficient details');
    }
    try {
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
}
