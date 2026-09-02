import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'specialization_master' })
export class Specialization {
  @PrimaryGeneratedColumn({
    type: 'smallint',
  })
  id!: number;

  @Column({
    name: 'specialization_name',
    type: 'varchar',
    length: 100,
  })
  specializationName!: string;

  @Column({
    name: 'specialization_code',
    type: 'varchar',
    length: 20,
    nullable: true,
    unique: true,
  })
  specializationCode?: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
