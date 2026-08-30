import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * * DTO for update health institute profile
 */
export class UpdateHealthInstituteProfileDto {
  @IsInt()
  @IsNotEmpty()
  healthInstituteProfileId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  registrationNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsInt()
  stateId!: number;

  @IsInt()
  districtId!: number;

  @IsString()
  @MaxLength(6)
  pincode!: string;
}

export class AppointDoctorDto {
  @IsInt()
  @Min(1)
  healthInstitutePrimaryKey!: number;

  @IsInt()
  @Min(1)
  doctorPrimaryKey!: number;

  @IsString()
  @IsNotEmpty()
  doctorId!: string;

  @IsInt()
  @Min(1)
  departmentId!: number;

  @IsInt()
  @Min(1)
  designation!: number;

  @IsDateString()
  joiningDate!: string;

  @IsInt()
  @Min(1)
  consultationScope!: number;

  @IsOptional()
  @IsString()
  affiliationNotes?: string;
}

export class GetAppointedDoctorsListDto {
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
  departmentId?: number;

  @IsInt()
  @IsOptional()
  designationId?: number;

  @IsInt()
  @IsOptional()
  consultationScopeId?: number;
}
