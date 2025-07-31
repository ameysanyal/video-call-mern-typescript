export interface ApiResponseData<T = any> {
  data?: T | null;
  meta?: Record<string, any> | null;
  success?: boolean;
  statusCode?: number;
  message?: string;
  language?: string;
}
