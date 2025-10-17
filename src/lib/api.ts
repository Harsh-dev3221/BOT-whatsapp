// API client for backend communication

import type {
  ApiResponse,
  Business,
  Bot,
  Message,
  BusinessStats,
  MessageStats,
  PaginatedResponse,
  Booking,
  BookingStats,
  CustomerAnalytics,
  BookingTrend,
  BotDashboardAuth
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // Business endpoints
  async getBusinesses(): Promise<ApiResponse<Business[]>> {
    return this.request<Business[]>('/businesses');
  }

  async getBusiness(id: string): Promise<ApiResponse<Business>> {
    return this.request<Business>(`/businesses/${id}`);
  }

  async createBusiness(data: Partial<Business>): Promise<ApiResponse<Business>> {
    return this.request<Business>('/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBusiness(id: string, data: Partial<Business>): Promise<ApiResponse<Business>> {
    return this.request<Business>(`/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBusiness(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/businesses/${id}`, {
      method: 'DELETE',
    });
  }

  async getBusinessStats(id: string): Promise<ApiResponse<BusinessStats>> {
    return this.request<BusinessStats>(`/businesses/${id}/stats`);
  }

  // Bot endpoints
  async getBots(businessId?: string): Promise<ApiResponse<Bot[]>> {
    const query = businessId ? `?business_id=${businessId}` : '';
    return this.request<Bot[]>(`/bots${query}`);
  }

  async getBot(id: string): Promise<ApiResponse<Bot>> {
    return this.request<Bot>(`/bots/${id}`);
  }

  async createBot(data: Partial<Bot>): Promise<ApiResponse<Bot>> {
    return this.request<Bot>('/bots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBot(id: string, data: Partial<Bot>): Promise<ApiResponse<Bot>> {
    return this.request<Bot>(`/bots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createWebBot(data: {
    business_id: string;
    name: string;
    theme?: { primaryColor: string; botName: string };
    greeting?: string;
    allowed_origins?: string[];
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/web-bot/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Web Chat endpoints
  async enableWebChat(botId: string, settings?: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/web-bot/${botId}/enable`, {
      method: 'POST',
      body: JSON.stringify(settings || {}),
    });
  }

  async disableWebChat(botId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/web-bot/${botId}/disable`, {
      method: 'POST',
    });
  }

  async getWebBot(botId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/web-bot/${botId}`, {});
  }

  async refreshWebBotToken(botId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/web-bot/${botId}/refresh-token`, {
      method: 'POST',
    });
  }

  async deleteBot(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/bots/${id}`, {
      method: 'DELETE',
    });
  }

  async startBot(id: string): Promise<ApiResponse<{ qrCode?: string }>> {
    return this.request<{ qrCode?: string }>(`/bots/${id}/start`, {
      method: 'POST',
    });
  }

  async stopBot(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/bots/${id}/stop`, {
      method: 'POST',
    });
  }

  async getBotQR(id: string): Promise<ApiResponse<{ qr_code: string | null; status: string }>> {
    return this.request<{ qr_code: string | null; status: string }>(`/bots/${id}/qr`);
  }

  async requestPairingCode(id: string, phoneNumber: string): Promise<ApiResponse<{ pairingCode?: string }>> {
    return this.request<{ pairingCode?: string }>(`/bots/${id}/pairing-code`, {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber }),
    });
  }

  async getPairingCode(id: string): Promise<ApiResponse<{ pairingCode: string }>> {
    return this.request<{ pairingCode: string }>(`/bots/${id}/pairing-code`);
  }

  async getBotCredentials(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/bots/${id}/credentials`);
  }

  async sendMessage(botId: string, toNumber: string, content: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/bots/${botId}/send`, {
      method: 'POST',
      body: JSON.stringify({ to_number: toNumber, content }),
    });
  }

  async getBotSettings(botId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/bots/${botId}/settings`);
  }

  async updateBotSettings(botId: string, data: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/bots/${botId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Message endpoints
  async getMessages(params?: {
    business_id?: string;
    bot_id?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Message>>> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<PaginatedResponse<Message>>(`/messages?${query}`);
  }

  async getMessage(id: string): Promise<ApiResponse<Message>> {
    return this.request<Message>(`/messages/${id}`);
  }

  async getConversation(
    botId: string,
    phoneNumber: string,
    page = 1,
    limit = 50
  ): Promise<ApiResponse<PaginatedResponse<Message>>> {
    return this.request<PaginatedResponse<Message>>(
      `/messages/conversation/${botId}/${phoneNumber}?page=${page}&limit=${limit}`
    );
  }

  async getMessageStats(businessId: string): Promise<ApiResponse<MessageStats>> {
    return this.request<MessageStats>(`/messages/stats/${businessId}`);
  }

  async deleteMessage(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/messages/${id}`, {
      method: 'DELETE',
    });
  }

  // Bot Dashboard endpoints
  async botDashboardLogin(botId: string, username: string, password: string): Promise<ApiResponse<BotDashboardAuth>> {
    return this.request<BotDashboardAuth>(`/bot-dashboard/${botId}/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async botDashboardChangePassword(
    botId: string,
    currentPassword: string,
    newPassword: string,
    authHeader: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/bot-dashboard/${botId}/change-password`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getBotBookings(
    botId: string,
    authHeader: string,
    params?: {
      status?: string;
      start_date?: string;
      end_date?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<{ data: Booking[]; pagination: any }>> {
    // Filter out undefined values
    const filteredParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          filteredParams[key] = String(value);
        }
      });
    }
    const query = new URLSearchParams(filteredParams).toString();
    const url = query ? `/bot-dashboard/${botId}/bookings?${query}` : `/bot-dashboard/${botId}/bookings`;
    return this.request<{ data: Booking[]; pagination: any }>(url, {
      headers: {
        'Authorization': authHeader,
      },
    });
  }

  async getBotBooking(botId: string, bookingId: string, authHeader: string): Promise<ApiResponse<Booking>> {
    return this.request<Booking>(`/bot-dashboard/${botId}/bookings/${bookingId}`, {
      headers: {
        'Authorization': authHeader,
      },
    });
  }

  async updateBookingStatus(
    botId: string,
    bookingId: string,
    status: string,
    notes: string | undefined,
    authHeader: string
  ): Promise<ApiResponse<Booking>> {
    return this.request<Booking>(`/bot-dashboard/${botId}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
      },
      body: JSON.stringify({ status, notes }),
    });
  }

  async getBotBookingStats(botId: string, authHeader: string): Promise<ApiResponse<BookingStats>> {
    return this.request<BookingStats>(`/bot-dashboard/${botId}/bookings/stats`, {
      headers: {
        'Authorization': authHeader,
      },
    });
  }

  async getBotCustomerAnalytics(botId: string, authHeader: string): Promise<ApiResponse<CustomerAnalytics>> {
    return this.request<CustomerAnalytics>(`/bot-dashboard/${botId}/analytics/customers`, {
      headers: {
        'Authorization': authHeader,
      },
    });
  }

  async getBotBookingTrends(botId: string, authHeader: string, days: number = 30): Promise<ApiResponse<BookingTrend[]>> {
    return this.request<BookingTrend[]>(`/bot-dashboard/${botId}/analytics/trends?days=${days}`, {
      headers: {
        'Authorization': authHeader,
      },
    });
  }
}

export const api = new ApiClient();

