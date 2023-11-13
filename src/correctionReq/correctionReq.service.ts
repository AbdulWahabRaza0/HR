import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class CorrectionReqService {
  constructor(
    @InjectModel('CorrectionReq') private CorrectionReq: Model<any>,
  ) {}
  async findMyCorrectionReq(crid) {
    try {
      const myCorrectionReq = await this.CorrectionReq.findById(crid);
      return myCorrectionReq;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async delMyCorrectionReq(crid: any) {
    try {
      const deletedCorrReq = await this.CorrectionReq.findByIdAndDelete(crid);
      return deletedCorrReq;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
