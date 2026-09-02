import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'state_master' })
export class State {
  @PrimaryGeneratedColumn({
    type: 'smallint',
  })
  id!: number;

  @Column({
    name: 'state_name',
    type: 'varchar',
    length: 100,
  })
  stateName!: string;

  @Column({
    name: 'state_code',
    type: 'varchar',
    length: 10,
    nullable: true,
    unique: true,
  })
  stateCode!: string;

  @Column({
    name: 'is_active',
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
