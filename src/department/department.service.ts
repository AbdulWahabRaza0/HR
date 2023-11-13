import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeService } from 'src/employee/employee.service';
// import { Roles } from 'src/utils/utils';
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
  async giveMyDeptByEmpId(eid: any) {
    try {
      const myDept = await this.Department.findOne({
        EID: eid,
      });
      return myDept;
    } catch (e) {
      console.log(e);
      throw new Error('Invalid error');
    }
  }
  async remEmployeeFromDept(did: string, eid: string) {
    try {
      const remEmp = await this.Department.findByIdAndUpdate(
        did,
        { $pull: { EID: eid } },
        { new: true },
      );
      return remEmp;
    } catch (e) {
      console.log(e);
      throw new Error('Invalid error');
    }
  }
}
