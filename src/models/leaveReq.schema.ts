import * as mongoose from 'mongoose';
const Schema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    default: 3,
    immutable: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    default: 0,
    enum: [0, 1, 2],
  },
});
const LeaveReq = Schema;
export default LeaveReq;
