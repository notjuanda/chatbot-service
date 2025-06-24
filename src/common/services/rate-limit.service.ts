import { Injectable } from '@nestjs/common';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitService {
  private readonly ipLimits = new Map<string, RateLimitEntry>();
  private readonly MAX_REQUESTS_PER_HOUR = 10; // Máximo 10 mensajes por hora por IP
  private readonly HOUR_IN_MS = 60 * 60 * 1000;

  isAllowed(ip: string): boolean {
    const now = Date.now();
    const entry = this.ipLimits.get(ip);

    if (!entry) {
      // Primera vez que se ve esta IP
      this.ipLimits.set(ip, {
        count: 1,
        resetTime: now + this.HOUR_IN_MS,
      });
      return true;
    }

    // Verificar si el tiempo ha expirado
    if (now > entry.resetTime) {
      // Resetear contador
      this.ipLimits.set(ip, {
        count: 1,
        resetTime: now + this.HOUR_IN_MS,
      });
      return true;
    }

    // Verificar si ha excedido el límite
    if (entry.count >= this.MAX_REQUESTS_PER_HOUR) {
      return false;
    }

    // Incrementar contador
    entry.count++;
    return true;
  }

  getRemainingRequests(ip: string): number {
    const entry = this.ipLimits.get(ip);
    if (!entry) {
      return this.MAX_REQUESTS_PER_HOUR;
    }

    const now = Date.now();
    if (now > entry.resetTime) {
      return this.MAX_REQUESTS_PER_HOUR;
    }

    return Math.max(0, this.MAX_REQUESTS_PER_HOUR - entry.count);
  }

  getResetTime(ip: string): Date | null {
    const entry = this.ipLimits.get(ip);
    if (!entry) {
      return null;
    }

    return new Date(entry.resetTime);
  }

  // Limpiar entradas expiradas (puede ser llamado periódicamente)
  cleanup(): void {
    const now = Date.now();
    for (const [ip, entry] of this.ipLimits.entries()) {
      if (now > entry.resetTime) {
        this.ipLimits.delete(ip);
      }
    }
  }
} 