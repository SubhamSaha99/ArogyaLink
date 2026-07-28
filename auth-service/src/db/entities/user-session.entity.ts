import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserRole } from '../../util/constant';

@Entity('user_sessions')
@Index('idx_user_sessions_session_id', ['sessionId'], { unique: true })
@Index('idx_user_sessions_user_business_id', ['userBusinessId'])
export class UserSession {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'session_id',
    type: 'uuid',
    unique: true,
  })
  sessionId!: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;

  @Column({
    name: 'user_business_id',
    length: 20,
  })
  userBusinessId!: string;

  @Column({
    name: 'refresh_token_hash',
    type: 'text',
  })
  refreshTokenHash!: string;

  @Column({
    name: 'ip_address',
    length: 100,
  })
  ipAddress!: string;

  @Column({
    name: 'user_agent',
    type: 'text',
  })
  userAgent!: string;

  @Column({
    name: 'device_name',
    length: 200,
    nullable: true,
  })
  deviceName?: string;

  @Column({
    name: 'login_location',
    length: 255,
    nullable: true,
  })
  loginLocation?: string;

  @Column({
    name: 'is_active',
    default: true,
  })
  isActive!: boolean;

  @Column({
    name: 'last_activity',
    type: 'timestamp',
  })
  lastActivity!: Date;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
  })
  expiresAt!: Date;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
