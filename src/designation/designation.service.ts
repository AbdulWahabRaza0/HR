import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class DesignationService {
  constructor(@InjectModel('Designation') private Designation: Model<any>) {}
  async giveMyDesignation(desgId: any) {
    try {
      const myDesignation = await this.Designation.findById(desgId);
      return myDesignation;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async delMyDesignation(desgId: any) {
    try {
      const myDesignation = await this.Designation.findByIdAndDelete(desgId);
      return myDesignation;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
