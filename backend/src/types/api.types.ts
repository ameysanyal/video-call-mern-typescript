export interface ApiResponseData<T = any> {
  data?: T | null;
  meta?: any | null;
  success?: boolean;
  statusCode?: number;
  message?: string;
  language?: string;
}
