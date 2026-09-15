import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
  Matches,
  ValidateNested,
  IsNotEmpty,
  Max,
} from 'class-validator';
import { MedicationStatus } from '../common/utils/constants';

/**
 * @description medical document dto
 */
export class MedicalDocumentDto {
  @IsOptional()
  @IsMongoId()
  medicalRecordId?: string;

  @IsOptional()
  @IsMongoId()
  medicalRecrodId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  documentType?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

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
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'Start date must be in YYYY-MM-DD format',
  })
  startDate!: string;
}

/**
 * @description Create medical record dto
 */
export class CreateMedicalRecordDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientPrimaryKey?: number;

  @IsOptional()
  @IsString()
  patientId?: string;

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
 * @description insert medical documents dto
 */
export class UploadMedicalDocumentsDto {
  @IsString()
  patientId!: string;

  @IsMongoId()
  medicalRecordId!: string;

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
}

/**
 * @description  Medications item for update dto
 */
export class UpdateMedicationItemDto {
  @IsOptional()
  @IsMongoId()
  patientMedicationId?: string;

  @IsOptional()
  @IsMongoId()
  medicationId?: string;

  @IsOptional()
  @IsString()
  medicationName?: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'Start date must be in YYYY-MM-DD format',
  })
  startDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'End date must be in YYYY-MM-DD format',
  })
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([1, 2, 3, 4], {
    message: 'Status must be 1 (Active), 2 (Completed), 3 (Discontinued), or 4 (On Hold)',
  })
  status?: MedicationStatus;
}


/**
 * @description Update Medications Dto
 */
export class UpdateMedicationsDto {
  @IsString()
  patientId!: string;

  @IsMongoId()
  medicalRecordId!: string;

  @IsNotEmpty()
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
  @Type(() => UpdateMedicationItemDto)
  medications!: UpdateMedicationItemDto[];
}

/**
 * @description Get Patient Medical Records DTO.
 */
export class GetPatientMedicalRecordsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientPrimaryKey?: number;

  @IsOptional()
  @IsString()
  patientId?: string;

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
}