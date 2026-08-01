import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserSession } from '../db/entities/user-session.entity';
import { CreateSessionDto } from './session.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  async createSession(dto: CreateSessionDto): Promise<UserSession> {
    const session = this.sessionRepository.create({
      sessionId: randomUUID(),
      userBusinessId: dto.userBusinessId,
      role: dto.role,
      refreshTokenHash: dto.refreshTokenHash,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      deviceName: dto.deviceName,
      loginLocation: dto.loginLocation,
      isActive: true,
      lastActivity: new Date(),
      expiresAt: dto.expiresAt,
    });

    return await this.sessionRepository.save(session);
  }

  async validateSession(sessionId: string): Promise<UserSession> {
    const session = await this.sessionRepository.findOne({
      where: {
        sessionId,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found.');
    }

    if (!session.isActive) {
      throw new UnauthorizedException('Session is inactive.');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Session has expired.');
    }

    return session;
  }

  async updateLastActivity(sessionId: string): Promise<void> {
    await this.sessionRepository.update(
      { sessionId },
      {
        lastActivity: new Date(),
      },
    );
  }

  async deactivateSession(sessionId: string): Promise<void> {
    await this.sessionRepository.update(
      { sessionId },
      {
        isActive: false,
        refreshTokenHash: '',
        updatedAt: new Date(),
      },
    );
  }

  async deactivateAllSessions(userBusinessId: string): Promise<void> {
    await this.sessionRepository.update(
      { userBusinessId },
      {
        isActive: false,
      },
    );
  }

  async updateRefreshToken(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.sessionRepository.update(
      { sessionId },
      {
        refreshTokenHash,
        expiresAt,
        lastActivity: new Date(),
      },
    );
  }

  async findSessionBySessionId(sessionId: string): Promise<UserSession | null> {
    return this.sessionRepository.findOne({
      where: {
        sessionId,
      },
    });
  }

  async deleteExpiredSessions(): Promise<void> {
    await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < NOW()')
      .execute();
  }
}
