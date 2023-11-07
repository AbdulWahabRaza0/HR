import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class EmployeeService {
  async generateJWT(id: any): Promise<any> {
    const token = await jwt.sign({ id }, process.env.SECRET_KEY);
    return token;
  }
}
