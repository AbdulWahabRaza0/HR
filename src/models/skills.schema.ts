import * as mongoose from 'mongoose';
const Schema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    default: 1,
    immutable: true,
  },
  skillName: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
});
const Skills = Schema;
export default Skills;
