import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class EmployeeService {
  constructor(@InjectModel('Employee') private Employee: Model<any>) {}
  async generateJWT(id: any): Promise<any> {
    try {
      const token = await jwt.sign({ id }, process.env.SECRET_KEY);
      return token;
    } catch (e) {
      console.log(e);
      return '';
    }
  }
  async findUserByReq(req: any) {
    try {
      if (!req.user.userId) {
        return null;
      }
      const findUser = await this.Employee.findById(req.user.userId);
      if (!findUser) {
        return null;
      } else {
        return findUser;
      }
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
