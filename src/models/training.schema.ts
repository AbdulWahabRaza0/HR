import * as mongoose from 'mongoose';
const Schema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    default: 1,
    immutable: true,
  },
  trainingName: {
    type: String,
    required: true,
  },
  instituteName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tariningDuration: {
    type: String,
    required: true,
  },
  outcomeDetails: {
    type: String,
  },
});
const Trainings = Schema;
export default Trainings;
