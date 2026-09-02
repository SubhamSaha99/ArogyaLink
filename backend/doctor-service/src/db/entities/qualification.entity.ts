import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'qualification_master' })
export class Qualification {
  @PrimaryGeneratedColumn({
    type: 'smallint',
  })
  id!: number;

  @Column({
    name: 'qualification_name',
    type: 'varchar',
    length: 100,
  })
  qualificationName!: string;

  @Column({
    name: 'qualification_code',
    type: 'varchar',
    length: 20,
    nullable: true,
    unique: true,
  })
  qualificationCode?: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
