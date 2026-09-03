import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

/**
 * @description Health Institute Registration dto
 */
export class HealthInstituteRegDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsEmail()
  email!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  healthInstituteName!: string;

  @IsInt()
  healthInstituteType!: number;

  @IsString()
  @MinLength(6)
  password!: string;
}

/**
 * @description Health Institute login dto
 */
export class HealthInstituteLoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

/**
 * @description Doctor registration dto
 */
export class DoctorRegDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsEmail()
  email!: string;

  @Matches(/^\+[1-9]{1}[0-9]{3,14}$/, {
    message: 'Invalid Mobile Number',
  })
  mobile!: string;

  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  lastName!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

/**
 * @description Doctor Login dto
 */
export class DoctorLoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Matches(/^\+[1-9]{1}[0-9]{3,14}$/, {
    message: 'Invalid Mobile Number',
  })
  mobile?: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

/**
 * @description Patient registration dto
 */
export class PatientRegDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsEmail()
  email!: string;

  @Matches(/^\+[1-9]{1}[0-9]{3,14}$/, {
    message: 'Invalid Mobile Number',
  })
  mobile!: string;

  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  lastName!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

/**
 * @description Refresh Token Dto
 */
export class RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}
