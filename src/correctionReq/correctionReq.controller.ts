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
import { CorrectionReqService } from './correctionReq.service';
import { EmployeeService } from 'src/employee/employee.service';
import {
  CorrectionReqRequestDto,
  EIdQueryRequestDto,
  CRIDQueryRequestDto,
  ECRIDQueryRequestDto,
} from './correctionReq.dtos';
import { Model } from 'mongoose';
import { modules } from 'src/utils/utils';
@Controller('employee/correction/req')
export class CorrectionReqController {
  constructor(
    @InjectModel('CorrectionReq') private CorrectionReq: Model<any>,
    private readonly correctionReqService: CorrectionReqService,
    private readonly employeeService: EmployeeService,
  ) {}
  @Get()
  async allCorrections(@Req() req: Request, @Res() res: Response) {
    try {
      const all = await this.CorrectionReq.find({});
      res.status(200).json(all);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/me')
  @UseGuards(JwtAuthGuard)
  async myCorrectionReq(@Req() req: any, @Res() res: Response) {
    try {
      const myExmployee = await this.employeeService.findUserByReq(req);
      const myArr = [];
      if (myExmployee.CRID.length > 0) {
        for (const crid of myExmployee.CRID) {
          const mine =
            await this.correctionReqService.findMyCorrectionReq(crid);
          myArr.push(mine);
        }
      }
      res.status(200).json(myArr);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/add')
  @UseGuards(JwtAuthGuard)
  async addCorrection(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CorrectionReqRequestDto,
    @Query() query: EIdQueryRequestDto,
  ) {
    try {
      const { eid } = query;
      const { data } = body;
      if (!eid || !data) {
        res.status(401);
        throw new Error('Insufficient data');
      }
      const myEmp = await this.employeeService.giveMyEmployee(eid);
      if (!myEmp) {
        res.status(404);
        throw new Error('Employee not found');
      }
      const obayedRules = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('correctionReq'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const myCorrectionReq = await this.CorrectionReq.create(data);
      await myCorrectionReq.save();
      await myEmp.CRID.push(myCorrectionReq._id);
      await myEmp.save();
      res.status(201).json({ myEmp, myCorrectionReq });
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Put('/update')
  @UseGuards(JwtAuthGuard)
  async updateCorrection(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CorrectionReqRequestDto,
    @Query() query: CRIDQueryRequestDto,
  ) {
    try {
      const { crid } = query;
      const { data } = body;
      if (!crid || !data) {
        res.status(401);
        throw new Error('Insufficient data');
      }
      const obayedRules = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('correctionReq'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const myCorrectionReq = await this.CorrectionReq.findByIdAndUpdate(
        crid,
        data,
        {
          new: true,
        },
      );
      await myCorrectionReq.save();
      res.status(201).json(myCorrectionReq);
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
  @Delete('/delete')
  @UseGuards(JwtAuthGuard)
  async deleteCorrection(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: ECRIDQueryRequestDto,
  ) {
    try {
      const { eid, crid } = query;
      if (!eid || !crid) {
        res.status(401);
        throw new Error('Insufficient data');
      }
      const myEmp = await this.employeeService.giveMyEmployee(eid);
      if (!myEmp) {
        res.status(404);
        throw new Error('Employee not found');
      }
      const obayedRules = await this.employeeService.roleRulesTypical(
        req,
        modules.indexOf('correctionReq'),
      );
      if (!obayedRules.status) {
        res.status(401);
        throw new Error(obayedRules.error);
      }
      const myCorrectionReq = await this.CorrectionReq.findByIdAndDelete(crid);
      if (!myCorrectionReq) {
        res.status(401);
        throw new Error('Operation unsuccessful');
      }
      const remEmpFromDept =
        await this.employeeService.remCorrectionreqFromEmployee(eid, crid);
      res.status(201).json({ remEmpFromDept, myCorrectionReq });
    } catch (e) {
      console.log(e);
      res.status(500).json('Invalid Error');
    }
  }
}
