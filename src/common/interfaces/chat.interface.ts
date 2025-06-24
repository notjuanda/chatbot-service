export interface ChatResponse {
    response: string;
    productos: ProductDto[];
    remainingRequests?: number;
}

export interface ProductDto {
    id: number;
    name: string;
    description?: string;
    price?: number;
    stock?: number;
    brand?: string;
    category?: string;
    ingredients?: string[];
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatContext {
    products: ProductDto[];
    whatsappLink: string;
    conversationHistory: ChatMessage[];
}

export interface IChatService {
    chat(userId: string, message: string): Promise<ChatResponse>;
}

export interface ISessionService {
    findOrCreateSession(userId: string): Promise<string>;
    saveMessage(sessionId: string, content: string, role: 'user' | 'assistant'): Promise<void>;
    getConversationHistory(sessionId: string, limit?: number): Promise<ChatMessage[]>;
}

export interface IContextService {
    buildContext(products: any[], whatsappLink: string): string;
    mapProductsToDto(products: any[]): ProductDto[];
}

export interface IAiService {
    generateResponse(message: string, context?: string, conversationHistory?: ChatMessage[]): Promise<string>;
}

export interface IProductsService {
    getTopProducts(): Promise<any[]>;
    searchProducts(query: string): Promise<any[]>;
    getProductsByIngredient(ingredient: string): Promise<any[]>;
    getProductsByBrand(brand: string): Promise<any[]>;
} 