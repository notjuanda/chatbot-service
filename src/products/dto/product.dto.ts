export class ProductDto {
    id: number;
    nombre: string;
    slug: string;
    descripcion?: string;
    precioBob: number;
    precioUsd?: number;
    stock: number;
    activo: boolean;
    certificadoSinGluten: boolean;
    urlCertificado?: string;
    createdAt: Date;
    updatedAt: Date;
    
    // Relaciones
    marca?: {
        id: number;
        nombre: string;
    };
    
    categoria?: {
        id: number;
        nombre: string;
        descripcion?: string;
    };
    
    ingredientes?: Array<{
        id: number;
        nombre: string;
        descripcion?: string;
    }>;
    
    imagenes?: Array<{
        id: number;
        url: string;
    }>;
} 