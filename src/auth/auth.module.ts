import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { EmployeeModule } from '../employee/employee.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    EmployeeModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      //   signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [JwtStrategy],
  exports: [],
})
export class AuthModule {}
