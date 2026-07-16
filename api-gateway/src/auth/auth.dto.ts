import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class HealthInstituteRegDto {
  @IsInt()
  healthInstituteType!: number;

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

  @IsString()
  @MinLength(6)
  password!: string;
}

export class HealthInstituteLoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @Matches(/^[HND]\d{6}$/, {
    message: 'Invalid healthInstituteId',
  })
  healthInstituteId?: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class DoctorRegDto {
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
  middleName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
