export interface RecommendationResponse {
  success: boolean;
  product_id?: number;
  recommendations: Array<{
    id: number;
    score: number;
    // Add other product properties
  }>;
}

export interface ChatResponse {
  answer: string;
  sources?: string[];
}

export interface FileOperationResponse {
  success: boolean;
  message?: string;
  filename?: string;
  loaded_files?: string[];
}