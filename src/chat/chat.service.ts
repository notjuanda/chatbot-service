import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { ProductsService } from '../products/products.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly aiService: AiService,
    private readonly productsService: ProductsService,
  ) {}

  async processMessage(chatMessageDto: ChatMessageDto): Promise<ChatResponseDto> {
    const { message, sessionId, conversationHistory } = chatMessageDto;

    console.log('🔍 Procesando mensaje:', message);
    console.log('📝 SessionId:', sessionId);

    try {
      // Detectar si el usuario está pidiendo productos
      const isProductRequest = this.detectProductRequest(message);
      console.log('🛍️ Es consulta de productos:', isProductRequest);
      
      let context = '';
      let products: any[] = [];
      let categories: any[] = [];

      if (isProductRequest) {
        console.log('📦 Obteniendo productos de la BD...');
        try {
          // Obtener información de productos para el contexto
          const allProducts = await this.productsService.getAllProducts();
          const allCategories = await this.productsService.getCategories();
          
          console.log('✅ Productos obtenidos:', allProducts.length);
          console.log('✅ Categorías obtenidas:', allCategories.length);
          
          context = this.buildProductContext(allProducts, allCategories);
          categories = allCategories;
        } catch (dbError) {
          console.error('❌ Error obteniendo productos:', dbError);
        }
      }

      console.log('🤖 Generando respuesta con OpenAI...');
      // Generar respuesta con IA
      const aiResponse = await this.aiService.generateResponse(
        message,
        context,
        conversationHistory
      );
      console.log('✅ Respuesta de OpenAI generada');

      // Detectar si la IA sugiere escalar a WhatsApp
      const shouldEscalate = this.detectEscalation(aiResponse);
      console.log('📱 Debe escalar a WhatsApp:', shouldEscalate);
      
      let whatsappLink: string | undefined;
      if (shouldEscalate) {
        whatsappLink = await this.aiService.generateWhatsAppLink(message);
        console.log('🔗 Enlace WhatsApp generado');
      }

      // Si es una consulta de productos, buscar productos relevantes
      if (isProductRequest) {
        console.log('🔍 Buscando productos relevantes...');
        products = await this.findRelevantProducts(message);
        console.log('✅ Productos relevantes encontrados:', products.length);
      }

      const response = {
        message: aiResponse,
        sessionId,
        whatsappLink,
        products: products.length > 0 ? products : undefined,
        categories: categories.length > 0 ? categories : undefined,
      };

      console.log('✅ Respuesta final generada');
      return response;

    } catch (error) {
      console.error('❌ Error procesando mensaje:', error);
      
      const whatsappLink = await this.aiService.generateWhatsAppLink(message);
      
      return {
        message: 'Lo siento, estoy teniendo problemas técnicos. Por favor, contacta con nosotros por WhatsApp.',
        sessionId,
        whatsappLink,
      };
    }
  }

  private detectProductRequest(message: string): boolean {
    const productKeywords = [
      'producto', 'productos', 'comprar', 'precio', 'costo', 'categoría', 'categorias',
      'marca', 'marcas', 'pan', 'galletas', 'harina', 'sin gluten', 'gluten free',
      'recomendar', 'recomendación', 'buscar', 'encontrar', 'disponible', 'stock'
    ];

    const lowerMessage = message.toLowerCase();
    return productKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private buildProductContext(products: any[], categories: any[]): string {
    const productList = products.slice(0, 10).map(p => 
      `${p.nombre} - Bs. ${p.precioBob}${p.marca ? ` (${p.marca.nombre})` : ''}`
    ).join(', ');

    const categoryList = categories.map(c => c.nombre).join(', ');

    return `
      Productos disponibles: ${productList}
      Categorías: ${categoryList}
      Todos los productos están certificados sin gluten.
    `;
  }

  private async findRelevantProducts(message: string): Promise<any[]> {
    try {
      // Buscar productos por término de búsqueda
      const searchTerm = this.extractSearchTerm(message);
      if (searchTerm) {
        const products = await this.productsService.searchProducts(searchTerm);
        return products.slice(0, 5).map(p => ({
          id: p.id,
          nombre: p.nombre,
          precioBob: p.precioBob,
          descripcion: p.descripcion,
          categoria: p.categoria?.nombre,
          marca: p.marca?.nombre,
        }));
      }

      // Si no hay término específico, devolver algunos productos destacados
      const allProducts = await this.productsService.getAllProducts();
      return allProducts.slice(0, 3).map(p => ({
        id: p.id,
        nombre: p.nombre,
        precioBob: p.precioBob,
        descripcion: p.descripcion,
        categoria: p.categoria?.nombre,
        marca: p.marca?.nombre,
      }));

    } catch (error) {
      console.error('Error buscando productos:', error);
      return [];
    }
  }

  private extractSearchTerm(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Buscar patrones específicos primero
    const specificPatterns = [
      /pan\s+(?:con|de|sin)\s+(\w+)/i,
      /(?:buscar|quiero|necesito)\s+(.+?)(?:\s+sin\s+gluten)?$/i,
      /(?:productos?\s+)?(?:de|para)\s+(.+?)(?:\s+sin\s+gluten)?$/i,
    ];

    for (const pattern of specificPatterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    // Buscar palabras clave específicas de productos
    const productKeywords = [
      'pan', 'galletas', 'harina', 'semillas', 'integral', 'pastas', 'snacks',
      'repostería', 'panadería', 'cereales', 'granola', 'barras'
    ];

    const foundKeywords = productKeywords.filter(keyword => 
      lowerMessage.includes(keyword)
    );

    if (foundKeywords.length > 0) {
      return foundKeywords.join(' ');
    }

    // Si no hay patrón específico, buscar palabras clave de productos
    const productWords = message.split(' ').filter(word => 
      word.length > 3 && !['para', 'con', 'los', 'las', 'del', 'una', 'este', 'esta', 'hola', 'estoy', 'buscando'].includes(word.toLowerCase())
    );

    return productWords.slice(0, 3).join(' ');
  }

  private detectEscalation(response: string): boolean {
    const escalationKeywords = [
      'whatsapp', 'contactar', 'humano', 'especialista', 'ayuda adicional',
      'no puedo', 'no puedo ayudarte', 'escalar', 'transferir',
      'equipo de atención', 'atención al cliente', 'directamente',
      'equipo de ventas', 'equipo de soporte', 'equipo técnico',
      'departamento comercial', 'recomiendo contactar', 'contactes directamente',
      'brindarte la mejor atención', 'manera más personalizada'
    ];

    const lowerResponse = response.toLowerCase();
    return escalationKeywords.some(keyword => lowerResponse.includes(keyword));
  }
}
