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
  async roleRulesToRegisterUser(
    fetchedUser: any,
    role: number,
    moduleAccess: [],
  ) {
    //if user who requested to register new user belongs to lower class then throwing error
    if (fetchedUser.role <= role) {
      return {
        status: false,
        error: 'User has no permission to add this user',
      };
    }
    //if admin has not provided any module access to sub admin
    else if (
      fetchedUser.role === 2 &&
      role === 1 &&
      moduleAccess?.length <= 0
    ) {
      return {
        status: false,
        error: 'Admin has not provided any module permission to sub admin',
      };
    } else {
      return { status: true };
    }
  }
}
