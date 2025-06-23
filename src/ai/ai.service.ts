import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { IAiService, ChatMessage } from '../common/interfaces/chat.interface';

@Injectable()
export class AiService implements IAiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      baseURL: 'http://localhost:11434/v1', // Ollama API local
      apiKey: 'ollama', // cualquier string, no se valida
    });
  }

  async generateResponse(
    message: string,
    context?: string,
    conversationHistory?: ChatMessage[]
  ): Promise<string> {
    let prompt = this.buildPrompt(message, context, conversationHistory);

    const completion = await this.openai.chat.completions.create({
      model: 'llama3', // modelo local de Ollama
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: message }
      ],
      max_tokens: 400,
      temperature: 0.7,
    });
    
    return completion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';
  }

  private buildPrompt(
    message: string, 
    context?: string, 
    conversationHistory?: ChatMessage[]
  ): string {
    let prompt = `Eres un asistente virtual experto en productos sin gluten para la tienda Gluten Free Home. Tu objetivo es ayudar, recomendar productos, resolver dudas y vender de forma proactiva, amigable y profesional. Si el usuario pregunta por productos, recomienda los más populares o los que tengas en contexto. Si no tienes información suficiente, haz preguntas para entender mejor lo que busca. Si el usuario tiene una queja, responde con empatía y sugiere contactar a soporte humano. Siempre responde en español.\n`;
    
    if (context) {
      prompt += `Contexto adicional: ${context}\n`;
    }
    
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += '\nHistorial reciente:\n';
      conversationHistory.slice(-6).forEach(msg => {
        prompt += `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}\n`;
      });
    }
    
    prompt += `\nUsuario: ${message}\nAsistente:`;
    
    return prompt;
  }
} 