import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'health_institute_profile' })
@Index('idx_health_institute_profile_institute_id', ['healthInstituteId'], {
  unique: true,
})
export class HealthInstituteProfile {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({
    name: 'health_institute_id',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  healthInstituteId!: string;

  @Column({
    name: 'health_institute_name',
    type: 'varchar',
    length: 255,
  })
  healthInstituteName!: string;

  @Column({
    name: 'health_institute_type',
    type: 'int',
  })
  healthInstituteType!: number;

  @Column({
    name: 'registration_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  registrationNumber?: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email!: string;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone?: string | null;

  @Column({
    name: 'address',
    type: 'text',
    nullable: true,
  })
  address?: string | null;

  @Column({
    name: 'state_id',
    type: 'smallint',
    nullable: true,
  })
  stateId?: number | null;

  @Column({
    name: 'district_id',
    type: 'smallint',
    nullable: true,
  })
  districtId?: number | null;

  @Column({
    name: 'pincode',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  pincode?: string | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
