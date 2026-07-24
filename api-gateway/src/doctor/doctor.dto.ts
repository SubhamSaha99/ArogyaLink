import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class DoctorBasicDetailsDto {
  @IsString()
  @Matches(/^DOC\d{6}$/, {
    message: 'Invalid Doctor ID',
  })
  doctorId!: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Transform(({ value }) => value?.trim())
  middleName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === '' ? value : Number(value),
  )
  @IsIn([1, 2, 3], {
    message: 'Gender must be 1 (Male), 2 (Female), or 3 (Other)',
  })
  gender?: number;
}
