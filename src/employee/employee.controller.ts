import { Controller, Get, Req, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EmployeeService } from './employee.service';
import { Model } from 'mongoose';
@Controller('employee')
export class EmployeeController {
  constructor(
    @InjectModel('Employee') private Employee: Model<any>,
    private readonly employeeService: EmployeeService,
  ) {}

  @Get()
  async all(@Req() req: any, @Res() res: any) {
    try {
      const myEmployee = await this.Employee.find({});
      return res.status(200).json({ myEmployee });
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  }
}
