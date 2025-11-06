const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_BASE_URL_FORMS = process.env.NEXT_PUBLIC_API_BASE_URL_FORMS || 'http://localhost:8000';

import { AuthManager } from './auth';


interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  message?: string;
  status: number;
}

class ApiClient {
  private baseURL: string;
  private formsURL: string;

  constructor(baseURL: string, formsURL: string) {
    this.baseURL = baseURL;
    this.formsURL = formsURL;
  }

  private async base_request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Import AuthManager dynamically to avoid circular imports
    const { AuthManager } = await import('@/lib/auth');
    const authHeader = AuthManager.getAuthHeader();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        message: data.message || data.error || `Request failed with status ${response.status}`,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
        status: 0,
      };
    }
  }

  private async forms_request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.formsURL}${endpoint}`;

    const isNgrokHost = this.formsURL.includes('ngrok');
    const enableNgrokBypass = process.env.NEXT_PUBLIC_ENABLE_NGROK_BYPASS === 'true';

    // options.headers can be several types (Headers, string[][], or Record).
    // Normalize to a plain object for easy merging and conditional header insertion.
    const headersInit: Record<string, string> = {
      'Content-Type': 'application/json',
      ...AuthManager.getAuthHeader(),
      ...(options.headers as Record<string, string>),
    };

    // Only add the ngrok bypass header when explicitly enabled AND the target
    // looks like an ngrok tunnel. This avoids unnecessary custom headers which
    // can trigger CORS preflights or leak to unrelated backends.
    if (enableNgrokBypass && isNgrokHost) {
      headersInit['ngrok-skip-browser-warning'] = '1';
    }

    const config: RequestInit = {
      headers: headersInit,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        message: data.message || data.error || `Request failed with status ${response.status}`,
        status: response.status,
      };
    } catch (error) {
      console.error('Forms API request failed:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
        status: 0,
      };
    }
  }

  // Public endpoints
  async joinWaitlist(email: string): Promise<ApiResponse> {
    return this.forms_request('/v1/public/waitlist', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async submitContactMessage(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<ApiResponse> {
    return this.forms_request('/v1/public/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin endpoints
  async getWaitlistResponses(): Promise<ApiResponse> {
    return this.forms_request('/v1/admin/waitlist/responses');
  }

  async getContactResponses(): Promise<ApiResponse> {
    return this.forms_request('/v1/admin/contact/responses');
  }

  async getDashboardStats(): Promise<ApiResponse> {
    return this.forms_request('/v1/admin/stats');
  }

  async getWaitlistStats(): Promise<ApiResponse> {
    return this.forms_request('/v1/admin/stats/waitlist');
  }

  async getContactStats(): Promise<ApiResponse> {
    return this.forms_request('/v1/admin/stats/contact');
  }
}

export const apiClient = new ApiClient(API_BASE_URL, API_BASE_URL_FORMS);
export type { ApiResponse };