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

    // 3. Obtener productos relevantes basándose en el mensaje
    const { productos, whatsappLink } = await this.getRelevantProducts(message);
    
    // 4. Validar que los productos sean reales
    const productosValidados = this.validateProducts(productos);
    
    const productosDto = this.contextService.mapProductsToDto(productosValidados);
    const contexto = this.contextService.buildContext(productosValidados, whatsappLink);

    // 5. Obtener historial de conversación
    const conversationHistory = await this.sessionService.getConversationHistory(sessionId);

    // 6. Generar respuesta de IA
    const respuesta = await this.generateAiResponse(message, contexto, conversationHistory);

    // 7. Guardar respuesta de IA
    await this.sessionService.saveMessage(sessionId, respuesta, 'assistant');

    // 8. Devolver respuesta
    return { response: respuesta, productos: productosDto };
  }

  private validateProducts(productos: any[]): any[] {
    // Filtrar solo productos que tengan los campos mínimos requeridos
    return productos.filter(product => {
      if (!product || !product.id || !product.nombre) {
        return false;
      }
      
      // Convertir precio a número si viene como string
      const precio = typeof product.precioBob === 'string' 
        ? parseFloat(product.precioBob) 
        : product.precioBob;
      
      return typeof precio === 'number' && precio > 0;
    });
  }

  private async getRelevantProducts(message: string): Promise<{ productos: any[]; whatsappLink: string }> {
    const whatsappLink = this.whatsappService.generateWhatsAppLink();
    const lowerMessage = message.toLowerCase();
    
    let productos: any[] = [];
    
    try {
      // Buscar productos específicos basándose en el mensaje
      if (this.containsProductKeywords(lowerMessage)) {
        // Buscar productos que coincidan con el mensaje
        productos = await this.productsService.searchProducts(message);
        
        // Si no encuentra productos específicos, buscar por ingredientes
        if (productos.length === 0) {
          const ingredientKeywords = this.extractIngredientKeywords(lowerMessage);
          for (const ingredient of ingredientKeywords) {
            const ingredientProducts = await this.productsService.getProductsByIngredient(ingredient);
            productos = [...productos, ...ingredientProducts];
          }
        }
        
        // Si aún no encuentra, buscar por categorías
        if (productos.length === 0) {
          const categoryKeywords = this.extractCategoryKeywords(lowerMessage);
          for (const category of categoryKeywords) {
            const categoryProducts = await this.productsService.getProductsByCategory(category);
            productos = [...productos, ...categoryProducts];
          }
        }
      }
      
      // Si no encuentra productos específicos o el mensaje no es sobre productos, usar productos top
      if (productos.length === 0) {
        productos = await this.productsService.getTopProducts();
  }

      // Eliminar duplicados y limitar a 10 productos
      productos = productos
        .filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        )
        .slice(0, 10);
        
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      productos = [];
    }

    return { productos, whatsappLink };
  }

  private containsProductKeywords(message: string): boolean {
    const productKeywords = [
      'producto', 'productos', 'tienen', 'venden', 'ofrecen', 'disponible', 'disponibles',
      'pan', 'galleta', 'galletas', 'harina', 'pasta', 'pastas', 'cereal', 'cereales',
      'snack', 'snacks', 'bebida', 'bebidas', 'dulce', 'dulces', 'salado', 'salados',
      'sin gluten', 'gluten free', 'celiaco', 'celíaco', 'intolerancia'
    ];
    
    // Si es solo un saludo simple, no buscar productos automáticamente
    const simpleGreetings = ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'hi'];
    const isSimpleGreeting = simpleGreetings.some(greeting => 
      message.toLowerCase().trim() === greeting || 
      message.toLowerCase().trim() === greeting + '!'
    );
    
    if (isSimpleGreeting) {
      return false;
    }
    
    return productKeywords.some(keyword => message.includes(keyword));
  }

  private extractIngredientKeywords(message: string): string[] {
    const ingredientKeywords = [
      'almendra', 'almendras', 'coco', 'quinoa', 'arroz', 'maíz', 'avena', 'linaza', 
      'chia', 'girasol', 'sésamo', 'nuez', 'nueces', 'pistacho', 'pistachos', 'castaña', 'castañas'
    ];
    
    return ingredientKeywords.filter(keyword => message.includes(keyword));
  }

  private extractCategoryKeywords(message: string): string[] {
    const categoryKeywords = [
      'pan', 'galleta', 'cereal', 'snack', 'bebida', 'dulce', 'salado'
    ];
    
    return categoryKeywords.filter(keyword => message.includes(keyword));
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