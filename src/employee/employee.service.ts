import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { Roles } from 'src/utils/utils';
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
    req: any,
    role: number,
    moduleAccess: [],
    moduleNumber: number,
  ) {
    //if user who requested to register new user belongs to lower class then throwing error
    try {
      const fetchedUser = await this.findUserByReq(req);
      if (!fetchedUser) {
        return {
          status: false,
          error: 'Invalid Error',
        };
      }
      if (
        fetchedUser.role <= role &&
        fetchedUser.role !== Roles.indexOf('subAdmin')
      ) {
        return {
          status: false,
          error: 'User has no permission to add this user',
        };
      }
      //if admin has not provided any module access to sub admin
      else if (
        fetchedUser.role === Roles.indexOf('admin') &&
        role === Roles.indexOf('subAdmin') &&
        moduleAccess?.length <= 0
      ) {
        return {
          status: false,
          error: 'Admin has not provided any module permission to sub admin',
        };
      } else if (
        role === Roles.indexOf('employee') &&
        fetchedUser.role === Roles.indexOf('subAdmin')
      ) {
        const checkPermissions = fetchedUser.moduleAccess;
        if (checkPermissions.includes(moduleNumber)) {
          return { status: true };
        } else {
          return {
            status: false,
            error: 'sub admin has no permission to add employee',
          };
        }
      } else {
        return { status: true };
      }
    } catch (e) {
      console.log(e);
      return {
        status: false,
        message: 'Invalid Error',
      };
    }
  }
  async roleRulesToUpdateUser(req: any, id: any, moduleNumber: number) {
    //if user who requested to register new user belongs to lower class then throwing error
    try {
      const fetchedUser = await this.findUserByReq(req);
      if (!fetchedUser) {
        return {
          status: false,
          error: 'Invalid Error',
        };
      }
      const myUser = await this.Employee.findById(id);
      if (!myUser) {
        return {
          status: false,
          error: 'User not found',
        };
      }
      const role = myUser.role;
      if (
        fetchedUser.role <= role &&
        fetchedUser.role !== Roles.indexOf('subAdmin')
      ) {
        return {
          status: false,
          error: 'User has no permission to manipulate this user',
        };
      } else if (
        role === Roles.indexOf('employee') &&
        fetchedUser.role === Roles.indexOf('subAdmin')
      ) {
        const checkPermissions = fetchedUser.moduleAccess;
        if (checkPermissions.includes(moduleNumber)) {
          return { status: true };
        } else {
          return {
            status: false,
            error: 'sub admin has no permission to manipulate employee',
          };
        }
      } else {
        return { status: true };
      }
    } catch (e) {
      console.log(e);
      return { status: false, error: 'Invalid Error' };
    }
  }
}
