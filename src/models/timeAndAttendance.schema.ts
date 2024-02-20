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
  presentHours: [
    {
      hours: {
        type: Number,
        default: 0,
      },
      minutes: {
        type: Number,
        default: 0,
      },
      //copy below given checkin message from the outside checkin message
      checkInMessage: {
        type: String,
        required: true,
      },
      checkoutMessage: {
        type: String,
        required: true,
      },
      shortLeave: {
        type: Boolean,
        default: false,
      },
      shortLeaveMessage: {
        type: String,
        default: '',
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      absent: {
        type: Boolean,
        default: false,
      },
      hrPermission: {
        type: Boolean,
        default: false,
      },
      teamLeadPermission: {
        type: Boolean,
        default: false,
      },
    },
  ],
  checkInConfirmed: {
    type: Boolean,
    default: false,
  },
  checkInMessageTemp: {
    type: String,
    default: '',
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
  breakHour: [
    {
      hours: {
        type: Number,
        default: 0,
      },
      minutes: {
        type: Number,
        default: 0,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  breakHourTimestamp: {
    type: Date,
    default: Date.now,
  },
});
const TimeAndAttendance = Schema;
export default TimeAndAttendance;
