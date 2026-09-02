import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('doctor')
@Index('idx_doctor_id', ['doctor_id'], { unique: true })
@Index('idx_doctors_email', ['email'], { unique: true })
@Index('idx_doctors_mobile', ['mobile'], { unique: true })
export class Doctor {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  doctor_id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  mobile!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
