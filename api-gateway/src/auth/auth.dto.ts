import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsString, MinLength } from 'class-validator';

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
  @MinLength(1)
  password!: string;
}
