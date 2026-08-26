import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/**
 * * DTO for update health institute profile
 */
export class UpdateHealthInstituteProfileDto {
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
  departmentId!: string;

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