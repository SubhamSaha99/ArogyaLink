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
  ValidateNested,
  IsArray,
  IsNotEmpty,
  Max,
} from 'class-validator';

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

export class MedicalDocumentDto {
  @Type(() => Number)
  @IsInt()
  documentType!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'Document date must be in YYYY-MM-DD format',
  })
  documentDate?: string;
}

export class MedicalMedicationDto {
  @IsString()
  @IsNotEmpty()
  medicationName!: string;

  @IsString()
  @IsNotEmpty()
  dosage!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'Start date must be in YYYY-MM-DD format',
  })
  startDate!: string;
}

export class CreateMedicalRecordDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  patientPrimaryKey!: number;

  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  healthInstitutePrimaryKey?: number;

  @IsOptional()
  @IsString()
  healthInstituteId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  doctorPrimaryKey?: number;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  diagnosis!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'Started date must be in YYYY-MM-DD format',
  })
  startedDate!: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @ValidateNested({ each: true })
  @Type(() => MedicalDocumentDto)
  medicalDocuments?: MedicalDocumentDto[];

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @ValidateNested({ each: true })
  @Type(() => MedicalMedicationDto)
  medications?: MedicalMedicationDto[];
}

/**
 * * Get Doctor List DTO.
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
}