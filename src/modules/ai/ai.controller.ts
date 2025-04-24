import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ChatQuestionDto } from './dto/chat-question.dto';
import {
  RecommendationQueryDto,
  BatchRecommendationDto,
  RecommendationsRefavoritesDto,
  UpdateRecommendationDto,
} from './dto/recommendation.dto';
import { ResponseData } from 'src/common/global/globalClass';

@ApiTags('AI Services')
@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({ summary: 'Check AI service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @Get('health')
  async checkHealth(): Promise<ResponseData<any>> {
    try {
      const health = await this.aiService.checkHealth();
      return new ResponseData(health, HttpStatus.OK, 'Health check successful');
    } catch (error) {
      return new ResponseData(
        null,
        HttpStatus.SERVICE_UNAVAILABLE,
        error.message,
      );
    }
  }

  @ApiOperation({ summary: 'Update product recommendations' })
  @ApiBody({
    type: UpdateRecommendationDto,
    description: 'Product data to update recommendations',
    examples: {
      example: {
        summary: 'Product Update Example',
        value: {
          id: 111,
          name: 'Product Name',
          description: 'Product Description',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns product recommendations',
    type: ResponseData,
  })
  @Post('recommend/update')
  async updateRecomendations(
    @Body() updateDto: UpdateRecommendationDto,
  ): Promise<ResponseData<any>> {
    try {
      const recommendations =
        await this.aiService.updateRecomendations(updateDto);
      return new ResponseData(
        recommendations,
        HttpStatus.OK,
        'Recommendations updated successfully',
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @ApiOperation({ summary: 'Get product recommendations' })
  @ApiResponse({
    status: 200,
    description: 'Returns product recommendations',
    type: ResponseData,
  })
  @Get('recommend')
  async getRecommendations(
    @Query() query: RecommendationQueryDto,
  ): Promise<ResponseData<any>> {
    try {
      const recommendations = await this.aiService.getRecommendations(
        query.product_id,
        query.k,
      );
      return new ResponseData(
        recommendations,
        HttpStatus.OK,
        'Recommendations retrieved successfully',
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @ApiOperation({ summary: 'Get batch recommendations' })
  @ApiBody({ type: RecommendationsRefavoritesDto })
  @ApiResponse({
    status: 200,
    description: 'Returns batch recommendations',
    type: ResponseData,
  })
  @Post('recommend/favorites')
  async getRecommendationsRefavorites(
    @Body() batchDto: RecommendationsRefavoritesDto,
  ): Promise<ResponseData<any>> {
    try {
      const recommendations = await this.aiService.getRecommendationsFFavorites(
        batchDto.favorite_ids,
        batchDto.k,
      );
      return new ResponseData(
        recommendations,
        HttpStatus.OK,
        'recommendations retrieved successfully',
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @ApiOperation({ summary: 'Get batch recommendations' })
  @ApiBody({ type: BatchRecommendationDto })
  @ApiResponse({
    status: 200,
    description: 'Returns batch recommendations',
    type: ResponseData,
  })
  @Post('recommend/batch')
  async getBatchRecommendations(
    @Body() batchDto: BatchRecommendationDto,
  ): Promise<ResponseData<any>> {
    try {
      const recommendations = await this.aiService.getBatchRecommendations(
        batchDto.product_ids,
        batchDto.k,
      );
      return new ResponseData(
        recommendations,
        HttpStatus.OK,
        'Batch recommendations retrieved successfully',
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @ApiOperation({
    summary: 'Chat with AI',
    description:
      'Send a question to the AI chatbot with optional conversation history',
  })
  @ApiBody({
    type: ChatQuestionDto,
    description: 'Question and optional chat history',
    examples: {
      simple: {
        summary: 'Simple question',
        value: {
          question: 'What is this book about?',
          history: [],
        },
      },
      withHistory: {
        summary: 'Question with history',
        value: {
          question: 'Can you elaborate on that?',
          history: [
            { role: 'user', content: 'What is this book about?' },
            { role: 'assistant', content: 'This book is a novel about...' },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns chat response',
    type: ResponseData,
    schema: {
      example: {
        data: {
          answer: 'The book is about...',
          sources: ['page 1', 'page 2'],
        },
        statusCode: 200,
        message: 'Chat response received',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      example: {
        data: null,
        statusCode: 400,
        message: 'Error message here',
      },
    },
  })
  @Post('chatbot/chat')
  async getAnswer(
    @Body() chatDto: ChatQuestionDto,
  ): Promise<ResponseData<any>> {
    try {
      const answer = await this.aiService.getAnswer(chatDto);
      return new ResponseData(answer, HttpStatus.OK, 'Chat response received');
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @ApiOperation({ summary: 'Upload document for chatbot' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('chatbot/load-document')
  @UseInterceptors(FileInterceptor('file'))
  async loadDocument(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseData<any>> {
    try {
      const result = await this.aiService.loadDocument(file);
      return new ResponseData(
        result,
        HttpStatus.OK,
        'Document loaded successfully',
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @ApiOperation({ summary: 'Get loaded files' })
  @Get('chatbot/files')
  async getLoadedFiles(): Promise<ResponseData<any>> {
    try {
      const files = await this.aiService.getLoadedFiles();
      return new ResponseData(
        files,
        HttpStatus.OK,
        'Files retrieved successfully',
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @ApiOperation({ summary: 'Delete specific file' })
  @Delete('chatbot/files/:filename')
  async deleteFile(
    @Param('filename') filename: string,
  ): Promise<ResponseData<any>> {
    try {
      const result = await this.aiService.deleteFile(filename);
      return new ResponseData(
        result,
        HttpStatus.OK,
        'File deleted successfully',
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @ApiOperation({ summary: 'Delete all files' })
  @Delete('chatbot/files')
  async deleteAllFiles(): Promise<ResponseData<any>> {
    try {
      const result = await this.aiService.deleteAllFiles();
      return new ResponseData(
        result,
        HttpStatus.OK,
        'All files deleted successfully',
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @ApiOperation({ summary: 'Update product' })
  @ApiBody({
    type: UpdateRecommendationDto,
    description: 'Product data to update',
    examples: {
      example: {
        summary: 'Product Update Example',
        value: {
          name: 'Tên sản phẩm mới',
          description: 'Mô tả mới',
          category: 'Danh mục mới',
          price: 199.99,
        },
      },
    },
  })
  @Put('products/:id')
  async updateProduct(
    @Param('id') id: number,
    @Body() updateDto: UpdateRecommendationDto,
  ): Promise<ResponseData<any>> {
    try {
      const result = await this.aiService.updateProduct(id, updateDto);
      return new ResponseData(
        result,
        HttpStatus.OK,
        'Product updated successfully',
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, error.message);
    }
  }

  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @Delete('products/:id')
  async deleteProduct(@Param('id') id: number): Promise<ResponseData<any>> {
    try {
      const result = await this.aiService.deleteProduct(id);
      return new ResponseData(
        result,
        HttpStatus.OK,
        'Product deleted successfully',
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.BAD_REQUEST, error.message);
    }
  }
}
