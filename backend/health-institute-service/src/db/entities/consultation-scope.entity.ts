import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'consultation_scope_master' })
@Index('idx_consultation_scope_master_code', ['scopeCode'], {
  unique: true,
})
export class ConsultationScope {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'scope_name',
    type: 'varchar',
    length: 100,
  })
  scopeName!: string;

  @Column({
    name: 'scope_code',
    type: 'varchar',
    length: 50,
  })
  scopeCode!: string;

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