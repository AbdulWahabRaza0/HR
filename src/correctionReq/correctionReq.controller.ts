import {
  Controller,
  Get,
  //   Post,
  Put,
  Query,
  //   Delete,
  Req,
  Res,
  Body,
  //   UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';
import { CorrectionReqService } from './correctionReq.service';
import { EmployeeService } from 'src/employee/employee.service';
import { Model } from 'mongoose';
// import { modules } from 'src/utils/utils';
@Controller('employee/correction/req')
export class CorrectionReqController {
  constructor(
    @InjectModel('CorrectionReq') private CorrectionReq: Model<any>,
    private readonly correctionReqService: CorrectionReqService,
  ) {}
  @Get()
  async allCorrections(@Req() req: Request, @Res() res: Response) {
    try {
      const all = await this.CorrectionReq.find({});
      res.status(200).json(all);
    } catch (e) {
      console.log(e);
      res.status(500);
      throw new Error('Invalid Error');
    }
  }
  @Put()
  async addCorrection(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
  ) {
    try {
      const { cqid } = query;
      const { data } = body;
      if (!cqid || !data) {
        res.status(401);
        throw new Error('Insufficient data');
      }
      const myCorrectionReq = await this.CorrectionReq.create(data);
      await myCorrectionReq.save();
      res.status(201).json(myCorrectionReq);
    } catch (e) {
      console.log(e);
      res.status(500);
      throw new Error('Invalid Error');
    }
  }
}
