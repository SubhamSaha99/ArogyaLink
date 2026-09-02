import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'district_master' })
@Index('idx_district_master_state_id', ['stateId'])
@Index('idx_district_master_district_code', ['districtCode'], {
  unique: true,
})
export class District {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id!: number;

  @Column({
    name: 'state_id',
    type: 'int',
  })
  stateId!: number;

  @Column({
    name: 'district_name',
    type: 'varchar',
    length: 255,
  })
  districtName!: string;

  @Column({
    name: 'district_code',
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: true,
  })
  districtCode?: string;

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
