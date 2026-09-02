export interface RateLimitOptions {
  key: string;
  maxAttempts: number;
  blockDuration: number; // seconds
  message?: string;
}