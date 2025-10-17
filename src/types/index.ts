// Frontend types

export interface Business {
  id: string;
  name: string;
  email: string;
  phone: string;
  subscription_status: 'trial' | 'active' | 'inactive' | 'cancelled';
  subscription_plan: 'free' | 'basic' | 'pro' | 'enterprise';
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bot {
  id: string;
  business_id: string;
  name: string;
  phone_number: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'failed';
  qr_code: string | null;
  last_connected_at: string | null;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  bot_settings?: BotSettings;
}

export interface BotSettings {
  id: string;
  bot_id: string;
  greeting_message: string | null;
  auto_reply_enabled: boolean;
  auto_reply_message: string | null;
  business_hours_enabled: boolean;
  business_hours_start: string | null;
  business_hours_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  bot_id: string;
  business_id: string;
  from_number: string;
  to_number: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document';
  content: string;
  media_url: string | null;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface BusinessStats {
  totalBots: number;
  activeBots: number;
  totalMessages: number;
}

export interface MessageStats {
  total: number;
  inbound: number;
  outbound: number;
  today: number;
}

// Bot Dashboard Types
export interface Booking {
  id: string;
  business_id: string;
  bot_id: string;
  customer_name: string;
  customer_phone: string;
  booking_for: string | null;
  gender: string | null;
  service_id: string | null;
  service_name: string;
  service_price: number | null;
  booking_date: string;
  booking_time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  today: number;
  upcoming: number;
  totalRevenue: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  repeatCustomers: number;
  retentionRate: number;
  topCustomers: CustomerData[];
  allCustomers: CustomerData[];
}

export interface CustomerData {
  customerPhone: string;
  customerName: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  firstBooking: string;
  lastBooking: string;
}

export interface BookingTrend {
  date: string;
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface BotDashboardAuth {
  botId: string;
  botName: string;
  phoneNumber: string;
  status: string;
  needsPasswordChange: boolean;
}

