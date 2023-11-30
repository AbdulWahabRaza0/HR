import * as mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema;
const Schema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    default: 3,
    immutable: true,
  },
  LRID: [
    {
      type: ObjectId,
      ref: 'LeaveReq',
    },
  ],
  presentHours: [],
  checkInConfirmed: {
    type: Boolean,
    default: false,
  },
  breakOnConfirmed: {
    type: Boolean,
    default: false,
  },
  //to store check in time
  presentHoursTimeStamp: {
    type: Date,
    default: Date.now,
  },
  breakHour: [],
  breakHourTimestamp: {
    type: Date,
    default: Date.now,
  },
});
const TimeAndAttendance = Schema;
export default TimeAndAttendance;
