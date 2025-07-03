import { Injectable } from '@nestjs/common';
import { ISessionService, ChatMessage } from '../common/interfaces/chat.interface';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 horas

@Injectable()
export class RedisSessionService implements ISessionService {
    private redis: Redis;

    constructor() {
        if (process.env.REDIS_URL) {
            this.redis = new Redis(process.env.REDIS_URL);
        } else {
            throw new Error('REDIS_URL must be defined (use Railway Redis connection string)');
        }
    }

    async findOrCreateSession(userId: string): Promise<string> {
        let sessionId = await this.redis.get(`chat:session:${userId}`);
        if (!sessionId) {
        const newSessionId = uuidv4();
        await this.redis.set(`chat:session:${userId}`, newSessionId, 'EX', SESSION_TTL_SECONDS);
        await this.redis.expire(`chat:messages:${newSessionId}`, SESSION_TTL_SECONDS);
        return newSessionId;
        } else {
        // Refrescar TTL
        await this.redis.expire(`chat:session:${userId}`, SESSION_TTL_SECONDS);
        await this.redis.expire(`chat:messages:${sessionId}`, SESSION_TTL_SECONDS);
        return sessionId;
        }
    }

    async saveMessage(sessionId: string, content: string, role: 'user' | 'assistant'): Promise<void> {
        const message: ChatMessage = { role, content };
        await this.redis.rpush(`chat:messages:${sessionId}`, JSON.stringify(message));
        // Refrescar TTL
        await this.redis.expire(`chat:messages:${sessionId}`, SESSION_TTL_SECONDS);
    }

    async getConversationHistory(sessionId: string, limit: number = 6): Promise<ChatMessage[]> {
        const total = await this.redis.llen(`chat:messages:${sessionId}`);
        const start = Math.max(0, total - limit);
        const messages = await this.redis.lrange(`chat:messages:${sessionId}`, start, total);
        return messages.map(m => JSON.parse(m));
    }

    async cleanOldSessions(): Promise<void> {
        // Redis maneja expiración automática por TTL, no es necesario limpiar manualmente
        return;
    }

    async clearSession(userId: string): Promise<void> {
        const sessionId = await this.redis.get(`chat:session:${userId}`);
        if (sessionId) {
        await this.redis.del(`chat:messages:${sessionId}`);
        await this.redis.del(`chat:session:${userId}`);
        }
    }
} 