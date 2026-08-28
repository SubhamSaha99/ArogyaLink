import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'doctor_qualifications' })
@Index('idx_doctor_qualifications_doctor_id', ['doctorId'])
@Index('idx_doctor_qualifications_doctor_primary_key', ['doctorPrimaryKey'])
@Index('idx_doctor_qualifications_qualification_id', ['qualificationId'])
@Index('idx_doctor_qualifications_specialization_id', ['specializationId'])
@Index(
  'uk_doctor_qualification',
  ['doctorId', 'qualificationId', 'specializationId'],
  { unique: true },
)
export class DoctorQualification {
  @PrimaryGeneratedColumn()
  id!: number;

   @Column({
    name: 'doctor_primary_key',
    type: 'int',
  })
  doctorPrimaryKey!: number;

  @Column({
    name: 'doctor_id',
    type: 'varchar',
    length: 20,
  })
  doctorId!: string;

  @Column({
    name: 'qualification_id',
    type: 'int',
  })
  qualificationId!: number;

  @Column({
    name: 'specialization_id',
    type: 'int',
    nullable: true,
  })
  specializationId?: number;

  @Column({
    name: 'institution_name',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  institutionName?: string;

  @Column({
    name: 'university_name',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  universityName?: string;

  @Column({
    name: 'year_of_completion',
    type: 'smallint',
    nullable: true,
  })
  yearOfCompletion?: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
