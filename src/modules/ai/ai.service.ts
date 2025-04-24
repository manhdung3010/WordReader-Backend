import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatQuestionDto } from './dto/chat-question.dto';
import axios from 'axios';
import { UpdateRecommendationDto } from './dto/recommendation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Repository } from 'typeorm';
import { In } from 'typeorm';

interface ChatResponse {
  answer: string;
  sources?: string[];
  error?: string;
}

interface RecommendationResponse {
  success: boolean;
  product_id?: number;
  recommendations: any[];
  error?: string;
}

interface FileOperationResponse {
  success: boolean;
  message?: string;
  filename?: string;
  loaded_files?: string[];
  error?: string;
}

@Injectable()
export class AiService {
  private readonly apiUrl: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    this.apiUrl = this.configService.get<string>('AI_API_URL');
  }

  async updateRecomendations(
    updateDto: UpdateRecommendationDto,
  ): Promise<RecommendationResponse> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/recommend/products`,
        updateDto,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to update recommendations: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  async getRecommendations(
    productId: number,
    k: number = 5,
  ): Promise<RecommendationResponse> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/recommend`, {
        params: { product_id: productId, k },
      });

      // Get full product information for each recommendation
      const recommendations = response.data.recommendations;
      const productIds = recommendations.map((rec) => rec.id);

      const fullProducts = await this.productRepository.find({
        where: { id: In(productIds) },
        relations: [
          'categories',
          'information',
          'keywords',
          'productWarehouse',
        ],
      });

      // Map the full product information to the recommendations
      const enrichedRecommendations = recommendations.map((rec) => {
        const fullProduct = fullProducts.find((p) => p.id === rec.id);
        return {
          ...rec,
          ...fullProduct,
        };
      });

      return {
        ...response.data,
        recommendations: enrichedRecommendations,
      };
    } catch (error) {
      throw new Error(
        `Failed to get recommendations: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  async getBatchRecommendations(
    productIds: number[],
    k: number = 5,
  ): Promise<RecommendationResponse> {
    try {
      const response = await axios.post(`${this.apiUrl}/api/recommend/batch`, {
        product_ids: productIds,
        k,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get batch recommendations: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  async getRecommendationsFFavorites(
    favorite_ids: number[],
    k: number = 20,
  ): Promise<RecommendationResponse> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/recommend/favorites`,
        {
          favorite_ids: favorite_ids,
          k,
        },
      );

      const recommendations = response.data.recommendations;
      const productIds = recommendations.map((rec) => rec.id);

      const fullProducts = await this.productRepository.find({
        where: { id: In(productIds) },
        relations: [
          'categories',
          'information',
          'keywords',
          'productWarehouse',
        ],
      });

      // Map the full product information to the recommendations
      const enrichedRecommendations = recommendations.map((rec) => {
        const fullProduct = fullProducts.find((p) => p.id === rec.id);
        return {
          ...rec,
          ...fullProduct,
        };
      });

      return {
        ...response.data,
        recommendations: enrichedRecommendations,
      };
    } catch (error) {
      throw new Error(
        `Failed to get recommendations: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  async getAnswer(chatDto: ChatQuestionDto): Promise<ChatResponse> {
    try {
      const response = await axios.post(`${this.apiUrl}/api/chatbot/chat`, {
        question: chatDto.question,
        history: chatDto.history,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get answer: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  async loadDocument(
    file: Express.Multer.File,
  ): Promise<FileOperationResponse> {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([file.buffer]), file.originalname);

      const response = await axios.post(
        `${this.apiUrl}/api/chatbot/load-document`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to load document: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  async getLoadedFiles(): Promise<FileOperationResponse> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/chatbot/files`);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get loaded files: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  async deleteFile(filename: string): Promise<FileOperationResponse> {
    try {
      const response = await axios.delete(
        `${this.apiUrl}/api/chatbot/files/${filename}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to delete file: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  async deleteAllFiles(): Promise<FileOperationResponse> {
    try {
      const response = await axios.delete(`${this.apiUrl}/api/chatbot/files`);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to delete all files: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  async checkHealth() {
    try {
      const response = await axios.get(`${this.apiUrl}/health`);
      return response.data;
    } catch (error) {
      throw new Error(
        `Health check failed: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  async updateProduct(
    productId: number,
    updateDto: UpdateRecommendationDto,
  ): Promise<RecommendationResponse> {
    try {
      const response = await axios.put(
        `${this.apiUrl}/api/recommend/products/${productId}`,
        updateDto,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to update product: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  async deleteProduct(productId: number): Promise<RecommendationResponse> {
    try {
      const response = await axios.delete(
        `${this.apiUrl}/api/recommend/products/${productId}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to delete product: ${error.response?.data?.error || error.message}`,
      );
    }
  }
}
