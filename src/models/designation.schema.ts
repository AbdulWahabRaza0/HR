import * as mongoose from 'mongoose';
const Schema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    default: 1,
    immutable: true,
  },
  name: {
    type: String,
    default: '',
  },
  deptName: {
    type: String,
    default: '',
  },
  salary: {
    type: Number,
    double: true,
    default: 0,
  },
});
const Designation = Schema;
export default Designation;
