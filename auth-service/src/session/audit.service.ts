import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityAuditLog } from '../db/entities/security-audit-log.entity';
import { CreateAuditLogDto } from './session.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(SecurityAuditLog)
    private readonly auditRepository: Repository<SecurityAuditLog>,
  ) {}

  async log(dto: CreateAuditLogDto): Promise<void> {
    const audit: SecurityAuditLog = this.auditRepository.create({
      userPrimaryKey: dto.userPrimaryKey,
      userBusinessId: dto.userBusinessId,
      role: dto.role,
      sessionId: dto.sessionId,
      action: dto.action,
      status: dto.status,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      remarks: dto.remarks,
    });

    await this.auditRepository.save(audit);
  }
}
