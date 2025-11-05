const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  message?: string;
  status: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
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

  // Public endpoints
  async joinWaitlist(email: string): Promise<ApiResponse> {
    return this.request('/v1/public/waitlist', {
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
    return this.request('/v1/public/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin endpoints
  async getWaitlistResponses(): Promise<ApiResponse> {
    return this.request('/v1/admin/waitlist/responses');
  }

  async getContactResponses(): Promise<ApiResponse> {
    return this.request('/v1/admin/contact/responses');
  }

  async getDashboardStats(): Promise<ApiResponse> {
    return this.request('/v1/admin/stats');
  }

  async getWaitlistStats(): Promise<ApiResponse> {
    return this.request('/v1/admin/stats/waitlist');
  }

  async getContactStats(): Promise<ApiResponse> {
    return this.request('/v1/admin/stats/contact');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse };