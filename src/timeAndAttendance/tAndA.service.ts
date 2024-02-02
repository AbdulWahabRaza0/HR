import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
@Injectable()
export class TANDAService {
  calculateTimeDifference(timestamp1: any, timestamp2: any) {
    const t1 = new Date(timestamp1).getTime();
    const t2 = new Date(timestamp2).getTime();
    const timeDifference = Math.abs(t2 - t1);
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60),
    );

    return { hours, minutes };
  }
}
