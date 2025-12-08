const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
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

  async updateWaitlistStatus(id: string, status: string): Promise<ApiResponse> {
    return this.forms_request(`/v1/admin/waitlist/responses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateContactStatus(id: string, status: string): Promise<ApiResponse> {
    return this.forms_request(`/v1/admin/contact/responses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Property endpoints
  async getProperties(): Promise<ApiResponse> {
    return this.base_request('/v1/public/property');
  }

  async getProperty(id: string): Promise<ApiResponse> {
    return this.base_request(`/v1/public/property/${id}`);
  }

  async addProperty(data: {
    name: string;
    description: string;
    documentId: string;
    type: string;
    location: string;
    value: number;
    shares: number;
    documents?: Array<{
      id: string;
      cid: string;
      filename: string;
      ipfsUrl: string;
      blockHash: string;
    }>;
  }): Promise<ApiResponse> {
    return this.base_request('/v1/admin/property', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProperty(id: string, data: Partial<{
    name: string;
    description: string;
    documentId: string;
    type: string;
    location: string;
    value: number;
    shares: number;
  }>): Promise<ApiResponse> {
    return this.base_request(`/v1/admin/property/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProperty(id: string): Promise<ApiResponse> {
    return this.base_request(`/v1/admin/property/${id}`, {
      method: 'DELETE',
    });
  }

  async deletePropertyWithDocuments(
    id: string,
    deleteDocuments: boolean = false
  ): Promise<ApiResponse> {
    // Import deletePropertyWithDocuments from property.ts if available
    // Otherwise delegate to deleteProperty
    try {
      // For now, import and call the function from property.ts
      const { deletePropertyWithDocuments: deletePropertyFn } = await import('./property');
      const result = await deletePropertyFn(id, deleteDocuments);
      return {
        success: result.success,
        data: {},
        message: result.message,
        status: result.success ? 200 : 400,
      };
    } catch {
      // Fallback to basic delete if import fails
      return this.deleteProperty(id);
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL, API_BASE_URL_FORMS);
export type { ApiResponse };