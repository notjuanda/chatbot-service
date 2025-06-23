import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
        let session = await this.sessionRepo.findOne({ 
        where: { userId }, 
        relations: ['messages'] 
        });
        
        if (!session) {
        session = this.sessionRepo.create({ userId });
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
    }

    async getConversationHistory(sessionId: string, limit: number = 10): Promise<IChatMessage[]> {
        const messages = await this.messageRepo.find({
        where: { sessionId },
        order: { createdAt: 'ASC' },
        take: limit,
        });
        
        return messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        }));
    }
} 