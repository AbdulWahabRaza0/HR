import mongoose from 'mongoose';
const Schema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    default: 2,
  },
  subject: {
    type: String,
    required: true,
    default: '',
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    default: 0,
    enum: [0, 1, 2],
  },
});
const CorrectionReq = Schema;
export default CorrectionReq;
