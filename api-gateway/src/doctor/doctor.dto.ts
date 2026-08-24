import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class DoctorBasicDetailsDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  middleName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  lastName?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined || value === null || value === ''
      ? value
      : Number(value),
  )
  @IsIn([1, 2, 3], {
    message: 'Gender must be 1 (Male), 2 (Female), or 3 (Other)',
  })
  gender?: number;
}

export class DoctorProfessionalDetailsDto {
  @IsString()
  @IsNotEmpty()
  medicalRegistration!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  registrationCouncil!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  registrationState!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  registrationYear!: number;

  @Type(() => Number)
  @IsInt()
  licenseStatus!: number;
}

export class DoctorQualification {
  @IsInt()
  qualificationId!: number;

  @IsOptional()
  @IsInt()
  specializationId?: number;

  @IsString()
  @MaxLength(200)
  institutionName?: string;

  @IsString()
  @MaxLength(200)
  universityName?: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  yearOfCompletion?: number;
}

export class DoctorQualificationsDto {
  @ValidateNested({ each: true })
  @Type(() => DoctorQualification)
  qualifications!: DoctorQualification[];
}

/**
 * * Get Doctor List DTO.
 */

export class GetDoctorListDto {
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
  councilId?: number;
}
