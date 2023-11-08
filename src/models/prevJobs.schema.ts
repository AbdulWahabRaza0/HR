import * as mongoose from 'mongoose';
const Schema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    default: 1,
    immutable: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  companyContact: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
    double: true,
    default: 0,
    required: true,
  },
});
const PrevJobs = Schema;
export default PrevJobs;
