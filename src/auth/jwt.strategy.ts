import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { EmployeeService } from 'src/employee/employee.service';
import { empStatus } from 'src/utils/utils';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly employeeService: EmployeeService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET_KEY,
    });
  }
  async validate(payload: any) {
    try {
      const myEmp = await this.employeeService.giveMyEmployee(payload.id);
      if (myEmp.status === empStatus.indexOf('inactive')) {
        throw new Error('Inactive user cannot request');
      } else {
        return { userId: payload.id };
      }
    } catch (e) {
      console.log(e);
      throw new Error('Middleware failed to validate');
    }
  }
}
