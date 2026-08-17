import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('db_exception_log')
export class DbExceptionLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  procedure_name!: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  error_code!: string;

  @Column({
    type: 'text',
  })
  error_message!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  error_details!: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  created_at!: Date;
}
