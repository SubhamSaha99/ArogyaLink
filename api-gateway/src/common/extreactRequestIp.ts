import { Request } from 'express';

export const extractRequestIp = (request: Request): string => {
    const forwardedFor = request.headers['x-forwarded-for'];
    const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor;

  return forwardedIp?.split(',')[0].trim() || request.ip || 'unknown';
};
