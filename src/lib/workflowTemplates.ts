export interface WorkflowTemplate {
  name: string;
  description: string;
  payload: any; // matches Backend workflows table shape (minus bot_id)
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    name: 'Valve Product Inquiry',
    description: 'Share catalog link → collect product, quantity, email, address → save inquiry',
    payload: {
      name: 'Valve Product Inquiry',
      workflow_type: 'custom',
      status: 'published',
      is_active: true,
      trigger: { keywords: ['inquiry', 'product', 'catalog', 'valve'] },
      steps: [
        {
          id: 'step1',
          type: 'share_media',
          prompt_message: 'Here is our product catalog: https://example.com/valves-catalog\nWhich product are you interested in?',
          media: null,
          next: 'step2',
        },
        {
          id: 'step2',
          type: 'collect_field',
          prompt_message: 'Please enter the product name or code.',
          collect_config: { field_key: 'product' },
          next: 'step3',
        },
        {
          id: 'step3',
          type: 'collect_field',
          prompt_message: 'Great. What quantity do you need?',
          collect_config: { field_key: 'quantity' },
          next: 'step4',
        },
        {
          id: 'step4',
          type: 'collect_field',
          prompt_message: 'Please share your email address for the quotation.',
          collect_config: { field_key: 'email' },
          next: 'step5',
        },
        {
          id: 'step5',
          type: 'collect_field',
          prompt_message: 'Lastly, your shipping address (optional).',
          collect_config: { field_key: 'address' },
          // no next = finish
        },
      ],
      actions: [{ type: 'save_to_database' }],
      ai_context: {},
    },
  },
  {
    name: 'Salon Appointment (Integrated Booking)',
    description: 'Triggers the integrated booking system with name → booking_for → gender → service details → date → time → confirmation → saves to bookings table',
    payload: {
      name: 'Salon Appointment (Integrated Booking)',
      workflow_type: 'booking',
      status: 'published',
      is_active: true,
      trigger: { keywords: ['book', 'appointment', 'salon', 'haircut', 'booking', 'schedule', 'reserve'] },
      steps: [
        {
          id: 'start_booking',
          type: 'start_booking',
          prompt_message: '👋 Starting your booking...',
          // This step hands off to the integrated booking system
          // The booking system will handle:
          // 1. Collecting name
          // 2. Who is booking for
          // 3. Gender
          // 4. Showing services with details from database
          // 5. Available dates
          // 6. Available time slots
          // 7. Confirmation
          // 8. Saving to bookings table
        },
      ],
      actions: [], // No actions needed - booking system handles everything
      ai_context: {},
    },
  },
];

