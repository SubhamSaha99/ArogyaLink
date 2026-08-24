import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'designation_master' })
@Index('idx_designation_master_code', ['designationCode'], {
  unique: true,
})
export class Designation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'designation_name',
    type: 'varchar',
    length: 100,
  })
  designationName!: string;

  @Column({
    name: 'designation_code',
    type: 'varchar',
    length: 50,
  })
  designationCode!: string;

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