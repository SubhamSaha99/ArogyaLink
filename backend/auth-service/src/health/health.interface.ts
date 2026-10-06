export interface ServiceDependencyHealth {
  status: 'up' | 'down';
  responseTimeMs?: number;
  error?: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  service: string;
  uptime: number;
  environment: string;
  dependencies: {
    database: ServiceDependencyHealth;
    redis: ServiceDependencyHealth;
  };
  memory: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
  };
}

export interface LivenessResponse {
  status: 'ok';
  service: string;
  timestamp: string;
  uptime: number;
}
