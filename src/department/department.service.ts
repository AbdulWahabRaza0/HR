import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeService } from 'src/employee/employee.service';
import { Roles } from 'src/utils/utils';
@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel('Department') private Department: Model<any>,
    private employeeService: EmployeeService,
  ) {}
  async giveMyDept(id: string) {
    try {
      const myDept = await this.Department.findById(id);
      return myDept;
    } catch (e) {
      console.log(e);
      throw new Error('Invalid error');
    }
  }
  async roleRulesDepartment(req: any, moduleNumber: number) {
    //if user who requested to register new user belongs to lower class then throwing error
    try {
      const fetchedUser = await this.employeeService.findUserByReq(req);
      if (!fetchedUser) {
        return {
          status: false,
          error: 'Invalid Error',
        };
      }

      //if any sub admin trying to register any employee then
      //check for it's permissions
      if (fetchedUser.role === Roles.indexOf('employee')) {
        return {
          status: false,
          error: 'user has no permission to register department',
        };
      }
      //if user belongs to sub admin then check the the permission
      else if (fetchedUser.role === Roles.indexOf('subAdmin')) {
        const checkPermissions = fetchedUser.moduleAccess;
        if (checkPermissions.includes(moduleNumber)) {
          return { status: true };
        } else {
          return {
            status: false,
            error: 'sub admin has no permission to add department',
          };
        }
      }
      //this means that super admin or admin tring to register any department
      //this is allowed
      else {
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
}
