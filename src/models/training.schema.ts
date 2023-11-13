import * as mongoose from 'mongoose';
const Schema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    default: 1,
    immutable: true,
  },
  trainingName: {
    type: String,
  },
  instituteName: {
    type: String,
  },
  description: {
    type: String,
  },
  tariningDuration: {
    type: String,
  },
  outcomeDetails: {
    type: String,
  },
});
const Trainings = Schema;
export default Trainings;
