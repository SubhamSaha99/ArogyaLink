import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('security_audit_log')
@Index('idx_security_audit_log_user_business_id', ['userBusinessId'])
@Index('idx_security_audit_log_session_id', ['sessionId'])
export class SecurityAuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'user_business_id',
    length: 20,
    nullable: true,
  })
  userBusinessId?: string;

  @Column({
    name: 'role',
    length: 30,
    nullable: true,
  })
  role?: string;

  @Column({
    name: 'session_id',
    type: 'uuid',
    nullable: true,
  })
  sessionId?: string;

  @Column({
    name: 'action',
    length: 50,
  })
  action!: string;

  @Column({
    name: 'status',
    length: 30,
  })
  status!: string;

  @Column({
    name: 'ip_address',
    length: 100,
    nullable: true,
  })
  ipAddress?: string;

  @Column({
    name: 'user_agent',
    type: 'text',
    nullable: true,
  })
  userAgent?: string;

  @Column({
    name: 'remarks',
    type: 'text',
    nullable: true,
  })
  remarks?: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;
}