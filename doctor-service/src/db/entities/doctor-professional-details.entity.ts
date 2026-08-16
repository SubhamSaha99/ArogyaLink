import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'doctor_professional_details' })
@Index('idx_doctor_professional_details_doctor_id', ['doctorId'], {
  unique: true,
})
export class DoctorProfessionalDetails {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({
    name: 'doctor_id',
    type: 'varchar',
    length: 20,
    unique: true,
  })
  doctorId!: string;

  @Column({
    name: 'medical_registration',
    type: 'varchar',
    length: 30,
    nullable: false,
  })
  medicalRegistration!: string;

  @Column({
    name: 'registration_council_id',
    type: 'smallint',
    nullable: false,
  })
  registrationCouncilId!: number;

  @Column({
    name: 'registration_state_id',
    type: 'smallint',
    nullable: true,
  })
  registrationStateId!: number;

  @Column({
    name: 'registration_year',
    type: 'smallint',
    nullable: true,
  })
  registrationYear!: number;

  @Column({
    name: 'license_status',
    type: 'smallint',
    nullable: true,
    comment: '1=Active, 2=Suspended, 3=Expired, 4=Revoked',
  })
  licenseStatus!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
