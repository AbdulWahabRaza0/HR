import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
const { ObjectId } = mongoose.Schema;
const Schema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    default: 1,
    immutable: true,
  },
  name: {
    type: String,
    required: true,
    default: '',
  },
  fatherName: { type: String, required: true },
  cnic: {
    type: String,
    required: true,
    default: '',
  },
  profileImg: {
    type: String,
    default:
      'https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg?size=338&ext=jpg&ga=GA1.1.1826414947.1698883200&semt=ais',
  },
  contact: {
    type: String,
    required: true,
  },
  emergencyContact: {
    type: String,
  },
  email: {
    type: String,
    trim: true,
    required: [true, 'email is required'],
    unique: true,
    match: [
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3],
  },
  moduleAccess: [
    {
      type: Number,
    },
  ],
  status: {
    type: Number,
    default: 0,
    enum: [0, 1],
  },
  CRID: [
    {
      type: ObjectId,
      ref: 'CorrectionReq',
    },
  ],
  DESGID: [
    {
      type: ObjectId,
      ref: 'Designation',
    },
  ],
  EXID: [
    {
      type: ObjectId,
      ref: 'Experience',
    },
  ],
});
//to save the password
Schema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  } else {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

//to compare password
Schema.methods.comparePassword = async function (enteredPassword: string) {
  const status = await bcrypt.compare(enteredPassword, this.password);

  return status;
};
// const Employee = mongoose.model('Employee', Schema);
const Employee = Schema;
export default Employee;
