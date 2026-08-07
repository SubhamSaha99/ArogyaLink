import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'registration_council_master' })
export class RegistrationCouncil {
  @PrimaryGeneratedColumn({
    type: 'smallint',
  })
  id!: number;

  @Column({
    name: 'council_name',
    type: 'varchar',
    length: 150,
  })
  councilName!: string;

  @Column({
    name: 'council_code',
    type: 'varchar',
    length: 20,
    nullable: true,
    unique: true,
  })
  councilCode?: string;

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
