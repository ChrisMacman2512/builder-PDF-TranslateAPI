/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * PDF Translation API types
 */
export interface TranslationRequest {
  sourceLanguage?: string;
  targetLanguage: string;
}

export interface TranslationResponse {
  success: boolean;
  message?: string;
  originalPages?: number;
  translatedPages?: number;
  processingTimeMs?: number;
}

export interface TranslationError {
  success: false;
  error: string;
  code?: string;
}

export type TranslationResult = TranslationResponse | TranslationError;
