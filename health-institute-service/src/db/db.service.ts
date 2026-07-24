import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      await this.dataSource.query('SELECT 1');

      this.logger.log('PostgreSQL connected successfully');

      const hasPendingMigrations = await this.dataSource.showMigrations();

      if (hasPendingMigrations) {
        this.logger.log('Running pending migrations...');

        const migrations = await this.dataSource.runMigrations();

        this.logger.log(`Executed ${migrations.length} migration(s)`);

        migrations.forEach((migration) =>
          this.logger.log(`Executed: ${migration.name}`),
        );
      } else {
        this.logger.log('No pending migrations found');
      }
    } catch (error) {
      this.logger.error('Database initialization failed', error);

      process.exit(1);
    }
  }

  async onApplicationShutdown() {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();

      this.logger.log('Database connection closed');
    }
  }
}
