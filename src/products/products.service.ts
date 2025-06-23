import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Product } from '../database/product.entity';
import { IProductsService } from '../common/interfaces/chat.interface';

@Injectable()
export class ProductsService implements IProductsService {
  constructor(
    @InjectRepository(Product, 'PRODUCTS_DB')
    private readonly productRepository: Repository<Product>,
  ) {}

  async searchProducts(query: string): Promise<any[]> {
    const lowerQuery = query.toLowerCase();
    
    // Búsqueda por nombre y descripción (las relaciones se manejan en el contexto)
    const products = await this.productRepository.find({
      where: [
        { nombre: ILike(`%${query}%`) },
        { descripcion: ILike(`%${query}%`) },
      ],
      relations: ['marca', 'ingredientes'],
      take: 10,
    });

    // Si no hay resultados directos, buscar por palabras clave de ingredientes comunes
    if (products.length === 0) {
      const commonIngredients = [
        'almendra', 'coco', 'quinoa', 'arroz', 'maíz', 'avena', 'linaza', 'chia', 'girasol', 'sésamo',
        'almendras', 'nueces', 'pistachos', 'castañas', 'harina', 'almidón', 'proteína', 'fibra',
        'gluten', 'sin gluten', 'gluten free', 'celiaco', 'celíaco', 'intolerancia'
      ];
      
      const matchingIngredients = commonIngredients.filter(ingredient => 
        lowerQuery.includes(ingredient)
      );

      if (matchingIngredients.length > 0) {
        // Buscar en descripción por ingredientes
        const ingredientQuery = matchingIngredients.join('|');
        return this.productRepository.find({
          where: { descripcion: ILike(`%${ingredientQuery}%`) },
          relations: ['marca', 'ingredientes'],
          take: 10,
        });
      }
    }

    return products;
  }

  async getTopProducts(): Promise<any[]> {
    // Devuelve los primeros 10 productos más populares
    return this.productRepository.find({ 
      where: { activo: true },
      relations: ['marca', 'ingredientes'],
      take: 10,
      order: { stock: 'DESC' } // Priorizar productos con más stock
    });
  }

  async getProductsByIngredient(ingredient: string): Promise<any[]> {
    // Búsqueda por ingrediente usando la relación
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.ingredientes', 'ingredient')
      .leftJoinAndSelect('product.marca', 'marca')
      .where('ingredient.nombre ILIKE :ingredient', { ingredient: `%${ingredient}%` })
      .orWhere('product.descripcion ILIKE :ingredient', { ingredient: `%${ingredient}%` })
      .take(10)
      .getMany();
  }

  async getProductsByBrand(brand: string): Promise<any[]> {
    // Búsqueda por marca usando la relación
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.marca', 'marca')
      .leftJoinAndSelect('product.ingredientes', 'ingredientes')
      .where('marca.nombre ILIKE :brand', { brand: `%${brand}%` })
      .orWhere('product.nombre ILIKE :brand', { brand: `%${brand}%` })
      .orWhere('product.descripcion ILIKE :brand', { brand: `%${brand}%` })
      .take(10)
      .getMany();
  }

  async getProductsByCategory(category: string): Promise<any[]> {
    // Búsqueda por categoría en el nombre o descripción
    return this.productRepository.find({
      where: [
        { nombre: ILike(`%${category}%`) },
        { descripcion: ILike(`%${category}%`) },
      ],
      relations: ['marca', 'ingredientes'],
      take: 10,
    });
  }

  async getProductsByPriceRange(minPrice?: number, maxPrice?: number): Promise<any[]> {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.marca', 'marca')
      .leftJoinAndSelect('product.ingredientes', 'ingredientes');
    
    if (minPrice !== undefined) {
      query.andWhere('product.precioBob >= :minPrice', { minPrice });
    }
    
    if (maxPrice !== undefined) {
      query.andWhere('product.precioBob <= :maxPrice', { maxPrice });
    }
    
    return query.take(10).getMany();
  }

  async getGlutenFreeProducts(): Promise<any[]> {
    // Productos certificados sin gluten
    return this.productRepository.find({
      where: { certificadoSinGluten: true },
      relations: ['marca', 'ingredientes'],
      take: 10,
    });
  }
} 