import { z } from 'zod';

export const auditRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'URL is required')
    .refine((val) => {
      try {
        const u = new URL(val.startsWith('http') ? val : `https://${val}`);
        return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.');
      } catch {
        return false;
      }
    }, 'A valid URL is required, e.g. https://openai.com')
    .transform((val) => (val.startsWith('http') ? val : `https://${val}`)),
});

export type AuditRequestBody = z.infer<typeof auditRequestSchema>;

export interface AuditResult {
  url: string;
  status: number | null;
  reachable: boolean;
  responseTime: number | null;
  title: string | null;
  cached: boolean;
  timestamp: string;
  requestId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
}

export interface AuditErrorPayload extends ApiResponse<never> {
  success: false;
  error: string;
  requestId: string;
}

export interface AuditSuccessPayload extends ApiResponse<AuditResult> {
  success: true;
  data: AuditResult;
  requestId: string;
}

export type AuditResponse = AuditSuccessPayload | AuditErrorPayload;
