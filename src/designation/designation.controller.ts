import {
  Controller,
  Get,
  //   Post,
  //   Put,
  //   Query,
  Req,
  Res,
  //   Body,
  //   UseGuards,
  //   Delete,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';
import { DesignationService } from './designation.service';
import { EmployeeService } from 'src/employee/employee.service';
import { Model } from 'mongoose';
// import { modules } from 'src/utils/utils';
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
}
