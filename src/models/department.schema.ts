import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema;
const Schema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    default: 0,
  },
  name: {
    type: String,
    required: true,
    default: '',
  },
  profileImg: {
    type: String,
    default:
      'https://www.sociology.ox.ac.uk/sites/default/files/styles/mt_image_medium_square/public/website_profile_picure_-_sociology_branding_grey.png?itok=w5T4fCnm',
  },
  contact: {
    type: String,
    required: true,
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
  employers: [
    {
      type: ObjectId,
      ref: 'Employee',
      required: true,
    },
  ],
});
const Department = Schema;
export default Department;
