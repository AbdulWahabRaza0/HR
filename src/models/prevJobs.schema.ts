import * as mongoose from 'mongoose';
const Schema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    default: 1,
    immutable: true,
  },
  jobTitle: {
    type: String,
  },
  companyName: {
    type: String,
  },
  companyContact: {
    type: String,
  },
  salary: {
    type: Number,
    double: true,
    default: 0,
  },
});
const PrevJobs = Schema;
export default PrevJobs;
