import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class ExperienceService {
  constructor(
    @InjectModel('Experience') private Experience: Model<any>,
    @InjectModel('Skills') private Skills: Model<any>,
    @InjectModel('PrevJobs') private PrevJobs: Model<any>,
    @InjectModel('Trainings') private Trainings: Model<any>,
  ) {}
  async giveMyExperience(exid: any) {
    try {
      const myExperience = await this.Experience.findById(exid)
        .populate('SKID')
        .populate('PJID')
        .populate('TRID');
      return myExperience;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async giveMySkill(skid: any) {
    try {
      const mySkill = await this.Skills.findById(skid);
      return mySkill;
    } catch (e) {
      return null;
    }
  }
  async giveMyTraining(tid: any) {
    try {
      const myTraining = await this.Trainings.findById(tid);
      return myTraining;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async giveMyPrevJob(pjid: any) {
    try {
      const myPrevJobs = await this.PrevJobs.findById(pjid);
      return myPrevJobs;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async delMyPrevJob(pjid: any) {
    try {
      const myPrevJob = await this.PrevJobs.findByIdAndDelete(pjid);
      return myPrevJob;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async delMySkill(skid: any) {
    try {
      const mySkill = await this.Skills.findByIdAndDelete(skid);
      return mySkill;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async delMyTraining(tid: any) {
    try {
      const myTraining = await this.Trainings.findByIdAndDelete(tid);
      return myTraining;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async delMyExperience(exid: any) {
    try {
      const myExperience = await this.Experience.findByIdAndDelete(exid);
      return myExperience;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
