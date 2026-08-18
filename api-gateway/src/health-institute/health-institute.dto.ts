import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

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
