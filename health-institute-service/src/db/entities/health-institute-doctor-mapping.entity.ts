import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'health_institute_doctor_mapping' })
@Index(
  'uq_health_institute_doctor_mapping',
  ['healthInstitutePrimaryKey', 'doctorPrimaryKey'],
  { unique: true },
)
@Index('idx_health_institute_doctor_mapping_health_institute_id', [
  'healthInstituteId',
])
@Index('idx_health_institute_doctor_mapping_doctor_id', ['doctorId'])
@Index('idx_health_institute_doctor_mapping_department_id', ['departmentId'])
export class HealthInstituteDoctorMapping {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'health_institute_primary_key',
    type: 'integer',
  })
  healthInstitutePrimaryKey!: number;

  @Column({
    name: 'health_institute_id',
    type: 'varchar',
    length: 255,
  })
  healthInstituteId!: string;

  @Column({
    name: 'doctor_primary_key',
    type: 'integer',
  })
  doctorPrimaryKey!: number;

  @Column({
    name: 'doctor_id',
    type: 'varchar',
    length: 20,
  })
  doctorId!: string;

  @Column({
    name: 'department_id',
    type: 'smallint',
  })
  departmentId!: number;

  @Column({
    name: 'designation',
    type: 'smallint',
  })
  designation!: number;

  @Column({
    name: 'joining_date',
    type: 'date',
  })
  joiningDate!: Date;

  @Column({
    name: 'consultation_scope',
    type: 'smallint',
  })
  consultationScope!: number;

  @Column({
    name: 'affiliation_notes',
    type: 'text',
    nullable: true,
  })
  affiliationNotes?: string | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
