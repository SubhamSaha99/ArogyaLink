import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'department_master' })
@Index('idx_department_master_code', ['departmentCode'], {
  unique: true,
})
export class Department {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'department_name',
    type: 'varchar',
    length: 100,
  })
  departmentName!: string;

  @Column({
    name: 'department_code',
    type: 'varchar',
    length: 50,
  })
  departmentCode!: string;

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