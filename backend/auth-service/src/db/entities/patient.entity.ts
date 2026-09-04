import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'patient' })
@Index('uq_patient_email', ['email'], { unique: true })
@Index('uq_patient_mobile', ['mobile'], { unique: true })
@Index('uq_patient_patient_id', ['patientId'], { unique: true })
export class Patient {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'patient_id',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: true
  })
  patientId!: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email?: string | null;

  @Column({
    name: 'mobile',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  mobile?: string | null;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
  })
  password!: string;

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