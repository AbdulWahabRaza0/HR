import * as mongoose from 'mongoose';
const Schema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    default: 1,
    immutable: true,
  },
  skillName: {
    type: String,
  },
  duration: {
    type: String,
  },
});
const Skills = Schema;
export default Skills;
