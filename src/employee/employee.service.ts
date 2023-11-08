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
  removeDuplicatesFromModuleAccessArray(arr?: []) {
    return [...new Set(arr)];
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
      //it is not allowed for lower class to register something
      //there is a condition if sub admin is trying to register something
      //then check for it's permissions
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
      //if any admin tring to add subadmin the check for its module access
      else if (
        fetchedUser.role === Roles.indexOf('admin') &&
        role === Roles.indexOf('subAdmin') &&
        moduleAccess?.length <= 0
      ) {
        return {
          status: false,
          error: 'Admin has not provided any module permission to sub admin',
        };
      }
      //if any sub admin trying to register any employee then
      //check for it's permissions
      else if (
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
  async roleRuleToChangeRoleOrModuleAccess(
    req: any,
    id: any,
    moduleControl: string,
    reqRole: any,
  ) {
    //here req role is for checking, if requested role is greater than current role then throw error
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
      //Role:
      //for role: added condition subadmin cannot change role
      //and requested role cannot be greater than the role of the
      //user who requested to change the role
      //if feteched user role is sub admin and it is increasing to admin
      //then vanish the all module access for him.
      //Module access:
      //only sub admin is allowed to gain modules access
      //requested user role should be greater than the role of the user.
      if (
        fetchedUser.role <= role || moduleControl === 'module'
          ? role !== Roles.indexOf('subAdmin')
          : role === Roles.indexOf('subAdmin') && reqRole >= fetchedUser.role
      ) {
        return {
          status: false,
          error: 'User has no permission to manipulate this user',
        };
      } else {
        return {
          status: true,
        };
      }
    } catch (e) {
      console.log(e);
      throw new Error('invalid Error');
    }
  }
  async giveMyEmployee(id: any) {
    try {
      const thisIsMine = await this.Employee.findById(id);
      return thisIsMine;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
