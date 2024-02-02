import { IsString, IsOptional, IsNumber } from 'class-validator';

export class SkillsDto {
  @IsOptional()
  @IsString()
  readonly skillName: string;

  @IsOptional()
  @IsString()
  readonly duration: string;
}
export class PrevJobDto {
  @IsOptional()
  @IsString()
  readonly jobTitle: string;

  @IsOptional()
  @IsString()
  readonly companyName: string;

  @IsOptional()
  @IsString()
  readonly companyContact: string;

  @IsOptional()
  @IsNumber()
  readonly salary: number;
}
export class TrainingDto {
  @IsOptional()
  @IsString()
  readonly trainingName: string;

  @IsOptional()
  @IsString()
  readonly instituteName: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsString()
  readonly tariningDuration: string;

  @IsOptional()
  @IsString()
  readonly outcomeDetails: string;
}
export class IdQuery {
  @IsString()
  readonly contact: string;
}
export class AddExpReqDto {
  skills: [SkillsDto];
  prevJobs: [PrevJobDto];
  trainings: [TrainingDto];
}
export class SkillReqDto {
  skill: SkillsDto;
}
export class PrevJobReqDto {
  prevJob: PrevJobDto;
}
export class TrainingReqDto {
  training: TrainingDto;
}
export class EIdQueryRequestDto {
  id: IdQuery;
}
export class SIdQueryRequestDto {
  sid: IdQuery;
}
export class PJIdQueryRequestDto {
  pjid: IdQuery;
}
export class TIdQueryRequestDto {
  tid: IdQuery;
}
export class ESIdQueryRequestDto {
  skid: IdQuery;
  eid: IdQuery;
}
