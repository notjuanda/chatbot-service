import { Injectable } from '@nestjs/common';
import { IChatService, ChatResponse } from '../common/interfaces/chat.interface';
import { SessionService } from './session.service';
import { ContextService } from './context.service';
import { ProductsService } from '../products/products.service';
import { AiService } from '../ai/ai.service';
import { WhatsAppService } from '../common/services/whatsapp.service';

@Injectable()
export class ChatService implements IChatService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly contextService: ContextService,
    private readonly productsService: ProductsService,
    private readonly aiService: AiService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  async chat(userId: string, message: string): Promise<ChatResponse> {
    // 1. Manejar sesión
    const sessionId = await this.sessionService.findOrCreateSession(userId);
    
    // 2. Guardar mensaje del usuario
    await this.sessionService.saveMessage(sessionId, message, 'user');

    // 3. Obtener productos y contexto
    const { productos, whatsappLink } = await this.getProductsAndWhatsAppLink();
    const productosDto = this.contextService.mapProductsToDto(productos);
    const contexto = this.contextService.buildContext(productos, whatsappLink);

    // 4. Obtener historial de conversación
    const conversationHistory = await this.sessionService.getConversationHistory(sessionId);

    // 5. Generar respuesta de IA
    const respuesta = await this.generateAiResponse(message, contexto, conversationHistory);

    // 6. Guardar respuesta de IA
    await this.sessionService.saveMessage(sessionId, respuesta, 'assistant');

    // 7. Devolver respuesta
    return { response: respuesta, productos: productosDto };
  }

  private async getProductsAndWhatsAppLink(): Promise<{ productos: any[]; whatsappLink: string }> {
    const whatsappLink = this.whatsappService.generateWhatsAppLink();
    
    let productos: any[] = [];
    try {
      productos = await this.productsService.getTopProducts();
    } catch (error) {
      // Si hay error, continuar con array vacío
      productos = [];
    }

    return { productos, whatsappLink };
  }

  private async generateAiResponse(
    message: string, 
    contexto: string, 
    conversationHistory: any[]
  ): Promise<string> {
    try {
      return await this.aiService.generateResponse(message, contexto, conversationHistory);
    } catch (error) {
      const whatsappLink = this.whatsappService.generateWhatsAppLink();
      return `¡Ups! Hubo un problema técnico y no puedo responder en este momento. Por favor, contacta a nuestro equipo humano por WhatsApp: ${whatsappLink}`;
    }
  }
} 