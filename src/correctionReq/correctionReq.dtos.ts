import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CorrectionReqDto {
  @IsOptional()
  @IsString()
  readonly subject: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsNumber()
  readonly status: number;
}
export class CorrectionReqRequestDto {
  data: CorrectionReqDto;
}
export class IdQuery {
  @IsString()
  readonly id: string;
}
export class Id2Query {
  @IsString()
  readonly id: string;
}
export class EIdQueryRequestDto {
  eid: IdQuery;
}
export class CRIDQueryRequestDto {
  crid: IdQuery;
}
export class ECRIDQueryRequestDto {
  eid: IdQuery;
  crid: Id2Query;
}
