import { ApiResponseData } from "../@types/api.types.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { Response } from "express";

// A reusable class to shape JSON responses consistently.
class ApiResponse {
  data: any | null;
  meta: any | null;
  success: boolean;
  statusCode: number;
  message: string;
  language?: string;

  constructor({
    data = null,
    meta = null,
    success = true,
    statusCode = HTTPSTATUS.OK || 200,
    message = "Execution Successful.",
    language,
  }: ApiResponseData) {
    this.data = data;
    this.meta = meta;
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.language = language;
  }
}

//A helper to send the ApiResponse object using Express’s res object.
const sendApiResponse = (res: Response, apiResponse: ApiResponse): Response => {
  return res.status(apiResponse.statusCode).json(apiResponse);
};

export { ApiResponse, sendApiResponse };
