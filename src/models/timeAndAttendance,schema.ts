import * as mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema;
const Schema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    default: 3,
    immutable: true,
  },
  LRID: {
    type: ObjectId,
    ref: 'LeaveReq',
  },
  presentHours: {
    type: String,
  },
  //to store check in time
  presentHoursTimeStamp: {
    type: Date,
    default: Date.now,
  },
  breakHour: {
    type: String,
  },
  breakHourTimestamp: {
    type: Date,
    default: Date.now,
  },
});
const TimeAndAttendance = Schema;
export default TimeAndAttendance;
