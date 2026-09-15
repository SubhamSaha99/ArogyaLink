import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  Min,
  Matches,
  Max,
} from 'class-validator';

/**
 * @description patient profile dto
 */
export class PatientProfileDetailsDto {
  @IsMongoId()
  patientProfileId!: string;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  middleName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'Date of birth must be in YYYY-MM-DD format',
  })
  dateOfBirth?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined || value === null || value === ''
      ? value
      : Number(value),
  )
  @IsInt()
  @Min(0)
  age?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined || value === null || value === ''
      ? value
      : Number(value),
  )
  @IsInt()
  @IsIn([1, 2, 3], {
    message: 'Gender must be 1 (Male), 2 (Female), or 3 (Other)',
  })
  gender?: number;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  address?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined || value === null || value === ''
      ? value
      : Number(value),
  )
  @IsInt()
  stateId?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined || value === null || value === ''
      ? value
      : Number(value),
  )
  @IsInt()
  districtId?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined || value === null || value === ''
      ? value
      : Number(value),
  )
  @IsInt()
  pincode?: number;
}

/**
 * @description Get Patient Details DTO.
 */
export class GetPatientDetailsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientPrimaryKey?: number;

  @IsOptional()
  @IsString()
  patientId?: string;
}

/**
 * @description Get Patient List DTO.
 */
export class GetPatientsListDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsInt()
  @IsOptional()
  stateId?: number;

  @IsInt()
  @IsOptional()
  doctorPrimaryKey?: number;

  @IsInt()
  @IsOptional()
  healthInstitutePrimaryKey?: number;
}
