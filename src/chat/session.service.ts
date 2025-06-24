import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ISessionService, ChatMessage as IChatMessage } from '../common/interfaces/chat.interface';

@Injectable()
export class SessionService implements ISessionService {
    constructor(
        @InjectRepository(ChatSession)
        private readonly sessionRepo: Repository<ChatSession>,
        @InjectRepository(ChatMessage)
        private readonly messageRepo: Repository<ChatMessage>,
    ) {}

    async findOrCreateSession(userId: string): Promise<string> {
        // Limpiar sesiones antiguas (más de 24 horas)
        await this.cleanOldSessions();
        
        let session = await this.sessionRepo.findOne({ 
            where: { userId }, 
            relations: ['messages'],
            order: { updatedAt: 'DESC' }
        });
        
        if (!session) {
            session = this.sessionRepo.create({ userId });
            await this.sessionRepo.save(session);
        } else {
            // Actualizar timestamp de la sesión
            session.updatedAt = new Date();
            await this.sessionRepo.save(session);
        }
        
        return session.id;
    }

    async saveMessage(sessionId: string, content: string, role: 'user' | 'assistant'): Promise<void> {
        const message = this.messageRepo.create({
            sessionId,
            content,
            role,
        });
        await this.messageRepo.save(message);
        
        // Actualizar timestamp de la sesión
        await this.sessionRepo.update(sessionId, { updatedAt: new Date() });
    }

    async getConversationHistory(sessionId: string, limit: number = 6): Promise<IChatMessage[]> {
        const messages = await this.messageRepo.find({
            where: { sessionId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
        
        // Devolver en orden cronológico (más antiguo primero)
        return messages.reverse().map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        }));
    }

    async cleanOldSessions(): Promise<void> {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        try {
            // Encontrar sesiones antiguas usando la sintaxis correcta de TypeORM
            const oldSessions = await this.sessionRepo.find({
                where: { updatedAt: LessThan(twentyFourHoursAgo) }
            });
            
            // Eliminar sesiones antiguas (esto también eliminará los mensajes por CASCADE)
            if (oldSessions.length > 0) {
                await this.sessionRepo.remove(oldSessions);
                console.log(`Limpieza automática: ${oldSessions.length} sesiones antiguas eliminadas`);
            }
        } catch (error) {
            console.error('Error limpiando sesiones antiguas:', error);
            // No lanzar el error para no interrumpir el flujo principal
        }
    }

    async clearSession(userId: string): Promise<void> {
        const session = await this.sessionRepo.findOne({ where: { userId } });
        if (session) {
            await this.sessionRepo.remove(session);
        }
    }
} 