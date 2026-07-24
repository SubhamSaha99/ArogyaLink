import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('doctor_profile')
export class DoctorProfile {
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
    name: 'email',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email!: string;

  @Column({
    name: 'mobile',
    type: 'varchar',
    length: 15,
    unique: true,
  })
  mobile!: string;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
  })
  firstName!: string;

  @Column({
    name: 'middle_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  middleName?: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
  })
  lastName!: string;

  @Column({
    name: 'gender',
    type: 'smallint',
    nullable: true,
    comment: '1-Male, 2-Female, 3-Other',
  })
  gender?: number;

  @Column({
    name: 'profile_image',
    type: 'text',
    nullable: true,
    comment: 'URL or path of the doctor profile image',
  })
  profileImage?: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}