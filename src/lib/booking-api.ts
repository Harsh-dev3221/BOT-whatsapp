// Booking API functions

const API_BASE = 'http://localhost:3000/api';

// ============================================
// SERVICES API
// ============================================

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price?: number;
  duration: number;
  category?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  category?: string;
  display_order?: number;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  category?: string;
  display_order?: number;
  is_active?: boolean;
}

export async function getServices(businessId: string): Promise<Service[]> {
  const response = await fetch(`${API_BASE}/businesses/${businessId}/services`);
  if (!response.ok) {
    throw new Error('Failed to fetch services');
  }
  const data = await response.json();
  return data.services;
}

export async function createService(businessId: string, serviceData: CreateServiceData): Promise<Service> {
  const response = await fetch(`${API_BASE}/businesses/${businessId}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceData),
  });
  if (!response.ok) {
    throw new Error('Failed to create service');
  }
  const data = await response.json();
  return data.service;
}

export async function updateService(
  businessId: string,
  serviceId: string,
  serviceData: UpdateServiceData
): Promise<Service> {
  const response = await fetch(`${API_BASE}/businesses/${businessId}/services/${serviceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceData),
  });
  if (!response.ok) {
    throw new Error('Failed to update service');
  }
  const data = await response.json();
  return data.service;
}

export async function deleteService(businessId: string, serviceId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/businesses/${businessId}/services/${serviceId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete service');
  }
}

// ============================================
// TIME SLOTS API
// ============================================

export interface TimeSlot {
  id: string;
  business_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  slot_duration: number; // minutes
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTimeSlotData {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration?: number;
}

export interface UpdateTimeSlotData {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  slot_duration?: number;
  is_active?: boolean;
}

export async function getTimeSlots(businessId: string): Promise<TimeSlot[]> {
  const response = await fetch(`${API_BASE}/businesses/${businessId}/time-slots`);
  if (!response.ok) {
    throw new Error('Failed to fetch time slots');
  }
  const data = await response.json();
  return data.timeSlots;
}

export async function createTimeSlot(businessId: string, slotData: CreateTimeSlotData): Promise<TimeSlot> {
  const response = await fetch(`${API_BASE}/businesses/${businessId}/time-slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slotData),
  });
  if (!response.ok) {
    throw new Error('Failed to create time slot');
  }
  const data = await response.json();
  return data.timeSlot;
}

export async function updateTimeSlot(
  businessId: string,
  slotId: string,
  slotData: UpdateTimeSlotData
): Promise<TimeSlot> {
  const response = await fetch(`${API_BASE}/businesses/${businessId}/time-slots/${slotId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slotData),
  });
  if (!response.ok) {
    throw new Error('Failed to update time slot');
  }
  const data = await response.json();
  return data.timeSlot;
}

export async function deleteTimeSlot(businessId: string, slotId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/businesses/${businessId}/time-slots/${slotId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete time slot');
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export function getDayName(dayOfWeek: number): string {
  return DAYS_OF_WEEK[dayOfWeek]?.label || 'Unknown';
}

export function formatTime(time: string): string {
  // Convert HH:MM:SS to HH:MM AM/PM
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}

