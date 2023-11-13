import { IsString, IsOptional, IsNumber } from 'class-validator';

export class DesignationDto {
  @IsOptional()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly deptName: string;

  @IsOptional()
  @IsNumber()
  readonly salary: string;
}
export class DesgReqDto {
  data: DesignationDto;
}
export class IdQuery {
  @IsString()
  readonly id: string;
}
export class EIdQueryReqDto {
  eid: IdQuery;
}
export class DESGIdQueryReqDto {
  desgId: IdQuery;
}
export class EDESGIdQueryReqDto {
  eid: IdQuery;
  desgId: IdQuery;
}
