import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('health_institute')
@Index('idx_health_institute_id', ['health_institute_id'], { unique: true })
@Index('idx_hospitals_email', ['email'], { unique: true })
export class HealthInstitute {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  health_institute_id!: string;

  @Column({ type: 'int' })
  health_institute_type!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  health_institute_name!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
